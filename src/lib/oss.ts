import OSS from 'ali-oss'

const client = new OSS({
  region: 'oss-cn-guangzhou',
  accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.ALI_OSS_BUCKET!,
})

export async function getOssUploadUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  const objectName = `${year}/${month}/${day}/${Date.now()}-${fileName}`
  
  const options = {
    expires: 3600,
    'Content-Type': contentType,
  }
  
  const uploadUrl = await client.signatureUrl(objectName, {
    method: 'PUT',
    expires: 3600,
    'Content-Type': contentType,
  })
  
  const fileUrl = `https://${process.env.ALI_OSS_BUCKET}.oss-cn-guangzhou.aliyuncs.com/${objectName}`
  
  return { uploadUrl, fileUrl }
}

export async function deleteOssFile(fileUrl: string): Promise<void> {
  if (!fileUrl.startsWith('https://')) {
    return
  }
  
  try {
    const objectName = fileUrl.replace(`https://${process.env.ALI_OSS_BUCKET}.oss-cn-guangzhou.aliyuncs.com/`, '')
    await client.delete(objectName)
  } catch (error) {
    console.error('删除OSS文件失败:', error)
  }
}
