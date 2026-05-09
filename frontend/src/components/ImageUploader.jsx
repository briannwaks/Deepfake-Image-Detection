import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUploadCloud } from 'react-icons/fi'
import styles from './ImageUploader.module.css'

const ACCEPTED = { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export default function ImageUploader({ onFileSelected, disabled }) {
  const [preview, setPreview] = useState(null)

  const onDrop = useCallback((accepted) => {
    if (!accepted.length) return
    const file = accepted[0]
    setPreview(URL.createObjectURL(file))
    onFileSelected(file)
  }, [onFileSelected])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: MAX_SIZE,
    disabled,
  })

  const rejection = fileRejections[0]?.errors[0]?.message

  return (
    <div className={styles.wrapper}>
      <div {...getRootProps()} className={`${styles.zone} ${isDragActive ? styles.active : ''} ${disabled ? styles.disabled : ''}`}>
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt="Preview" className={styles.preview} />
        ) : (
          <div className={styles.placeholder}>
            <FiUploadCloud size={40} />
            <p>{isDragActive ? 'Drop it here…' : 'Drag & drop an image, or click to browse'}</p>
            <span>JPEG · PNG · WebP · Max 10 MB</span>
          </div>
        )}
      </div>
      {rejection && <p className={styles.error}>{rejection}</p>}
    </div>
  )
}
