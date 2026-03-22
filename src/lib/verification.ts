import fs from 'fs'
import path from 'path'

// 验证码存储文件路径
const STORAGE_FILE = path.join(process.cwd(), '.verification-codes.json')

// 确保存储文件存在
function ensureStorageFile() {
  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify({}))
  }
}

// 读取存储的验证码
function readVerificationCodes(): Record<string, { code: string; expiresAt: number }> {
  ensureStorageFile()
  const data = fs.readFileSync(STORAGE_FILE, 'utf8')
  try {
    return JSON.parse(data)
  } catch {
    return {}
  }
}

// 写入验证码到存储
function writeVerificationCodes(codes: Record<string, { code: string; expiresAt: number }>) {
  ensureStorageFile()
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(codes, null, 2))
}

// 清理过期验证码
function cleanupExpiredCodes() {
  const codes = readVerificationCodes()
  const now = Date.now()
  const validCodes = Object.entries(codes).reduce((acc, [email, data]) => {
    if (now <= data.expiresAt) {
      acc[email] = data
    }
    return acc
  }, {} as Record<string, { code: string; expiresAt: number }>)
  writeVerificationCodes(validCodes)
}

// 生成6位随机验证码
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 存储验证码
export function storeVerificationCode(email: string, code: string): void {
  // 清理过期验证码
  cleanupExpiredCodes()
  
  // 验证码有效期10分钟
  const expiresAt = Date.now() + 10 * 60 * 1000
  const codes = readVerificationCodes()
  codes[email] = { code, expiresAt }
  writeVerificationCodes(codes)
  
  // 10分钟后自动清理该验证码
  setTimeout(() => {
    const codes = readVerificationCodes()
    delete codes[email]
    writeVerificationCodes(codes)
  }, 10 * 60 * 1000)
}

// 验证验证码
export function verifyVerificationCode(email: string, code: string): boolean {
  // 清理过期验证码
  cleanupExpiredCodes()
  
  const codes = readVerificationCodes()
  const stored = codes[email]
  
  if (!stored) {
    return false
  }
  
  if (Date.now() > stored.expiresAt) {
    delete codes[email]
    writeVerificationCodes(codes)
    return false
  }
  
  return stored.code === code
}

// 清理验证码
export function clearVerificationCode(email: string): void {
  const codes = readVerificationCodes()
  delete codes[email]
  writeVerificationCodes(codes)
}
