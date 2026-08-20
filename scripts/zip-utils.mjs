import { createReadStream } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { deflateRawSync, inflateRawSync } from "node:zlib"

const LOCAL_SIGNATURE = 0x04034b50
const CENTRAL_SIGNATURE = 0x02014b50
const END_SIGNATURE = 0x06054b50
const UTF8_FLAG = 0x0800
const DOS_DATE_1980_01_01 = 0x0021

export async function createDeterministicZip(archivePath, rootDirectory, paths) {
  const localParts = []
  const centralParts = []
  let offset = 0

  for (const path of [...paths].sort()) {
    assertSafeRelativePath(path)
    const name = Buffer.from(path.replaceAll("\\", "/"), "utf8")
    const content = await readFile(join(rootDirectory, path))
    const compressed = deflateRawSync(content, { level: 9 })
    const checksum = crc32(content)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(LOCAL_SIGNATURE, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(UTF8_FLAG, 6)
    local.writeUInt16LE(8, 8)
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(DOS_DATE_1980_01_01, 12)
    local.writeUInt32LE(checksum, 14)
    local.writeUInt32LE(compressed.length, 18)
    local.writeUInt32LE(content.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)
    localParts.push(local, name, compressed)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(CENTRAL_SIGNATURE, 0)
    central.writeUInt16LE(0x031e, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(UTF8_FLAG, 8)
    central.writeUInt16LE(8, 10)
    central.writeUInt16LE(0, 12)
    central.writeUInt16LE(DOS_DATE_1980_01_01, 14)
    central.writeUInt32LE(checksum, 16)
    central.writeUInt32LE(compressed.length, 20)
    central.writeUInt32LE(content.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt16LE(0, 30)
    central.writeUInt16LE(0, 32)
    central.writeUInt16LE(0, 34)
    central.writeUInt16LE(0, 36)
    const mode = path === "hsfr" ? 0o100755 : 0o100644
    central.writeUInt32LE(mode * 0x10000, 38)
    central.writeUInt32LE(offset, 42)
    centralParts.push(central, name)
    offset += local.length + name.length + compressed.length
  }

  const centralOffset = offset
  const centralSize = centralParts.reduce((size, part) => size + part.length, 0)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(END_SIGNATURE, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(paths.length, 8)
  end.writeUInt16LE(paths.length, 10)
  end.writeUInt32LE(centralSize, 12)
  end.writeUInt32LE(centralOffset, 16)
  end.writeUInt16LE(0, 20)

  await mkdir(dirname(archivePath), { recursive: true })
  await writeFile(archivePath, Buffer.concat([...localParts, ...centralParts, end]))
}

export async function extractZip(archivePath, destinationDirectory) {
  const archive = await readFile(archivePath)
  let offset = 0
  const files = []
  while (offset + 4 <= archive.length && archive.readUInt32LE(offset) === LOCAL_SIGNATURE) {
    const method = archive.readUInt16LE(offset + 8)
    const checksum = archive.readUInt32LE(offset + 14)
    const compressedSize = archive.readUInt32LE(offset + 18)
    const uncompressedSize = archive.readUInt32LE(offset + 22)
    const nameLength = archive.readUInt16LE(offset + 26)
    const extraLength = archive.readUInt16LE(offset + 28)
    const nameStart = offset + 30
    const path = archive.subarray(nameStart, nameStart + nameLength).toString("utf8")
    assertSafeRelativePath(path)
    const dataStart = nameStart + nameLength + extraLength
    const compressed = archive.subarray(dataStart, dataStart + compressedSize)
    const content = method === 8 ? inflateRawSync(compressed) : method === 0 ? compressed : undefined
    if (content === undefined || content.length !== uncompressedSize || crc32(content) !== checksum) {
      throw new Error(`Entrée ZIP invalide: ${path}`)
    }
    const outputPath = join(destinationDirectory, path)
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, content)
    files.push(path)
    offset = dataStart + compressedSize
  }
  if (files.length === 0) throw new Error("Archive ZIP vide ou invalide")
  return files
}

export async function sha256File(path, createHash) {
  const hash = createHash("sha256")
  for await (const chunk of createReadStream(path)) hash.update(chunk)
  return hash.digest("hex")
}

function assertSafeRelativePath(path) {
  const normalized = path.replaceAll("\\", "/")
  if (normalized.startsWith("/") || /^[A-Za-z]:/.test(normalized) || normalized.split("/").includes("..")) {
    throw new Error(`Chemin ZIP non sûr: ${path}`)
  }
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}
