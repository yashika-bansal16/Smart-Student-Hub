import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  Delete,
  CheckCircle,
  Error
} from '@mui/icons-material';

import { uploadAPI, apiUtils } from '../../services/api';
import toast from 'react-hot-toast';

const FileUpload = ({
  onFilesChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  initialFiles = [],
  label = "Upload Files"
}) => {
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.name} is too large. Max size is ${apiUtils.formatFileSize(maxSize)}`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name} is not a supported file type`);
          } else if (error.code === 'too-many-files') {
            toast.error(`Too many files. Maximum ${maxFiles} files allowed`);
          }
        });
      });
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      setUploading(true);
      const newFiles = [];

      for (const file of acceptedFiles) {
        try {
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          
          const response = await uploadAPI.uploadSingle(file, (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          });

          const uploadedFile = {
            id: Date.now() + Math.random(),
            name: response.data.data.name,
            filename: response.data.data.filename,
            url: response.data.data.url,
            size: response.data.data.size,
            mimetype: response.data.data.mimetype,
            uploadedAt: response.data.data.uploadedAt,
            status: 'uploaded'
          };

          newFiles.push(uploadedFile);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}`);
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
        }
      }

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
      setUploading(false);
      
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({});
      }, 2000);
    }
  }, [files, maxFiles, maxSize, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxFiles: maxFiles - files.length,
    maxSize,
    disabled: uploading || files.length >= maxFiles
  });

  const removeFile = async (fileToRemove) => {
    try {
      // Delete from server if it has a filename
      if (fileToRemove.filename) {
        await uploadAPI.deleteFile(fileToRemove.filename);
      }
      
      const updatedFiles = files.filter(file => file.id !== fileToRemove.id);
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
      toast.success('File removed successfully');
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove file');
    }
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return '🖼️';
    } else if (mimetype === 'application/pdf') {
      return '📄';
    } else if (mimetype.includes('word')) {
      return '📝';
    }
    return '📎';
  };

  const getDropzoneColor = () => {
    if (isDragReject) return 'error.main';
    if (isDragActive) return 'primary.main';
    return 'text.secondary';
  };

  const getDropzoneBgColor = () => {
    if (isDragReject) return 'error.light';
    if (isDragActive) return 'primary.light';
    return 'grey.50';
  };

  return (
    <Box>
      {/* Upload Area */}
      <Box
        {...getRootProps()}
        sx={{
          border: 2,
          borderStyle: 'dashed',
          borderColor: getDropzoneColor(),
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: uploading || files.length >= maxFiles ? 'not-allowed' : 'pointer',
          bgcolor: getDropzoneBgColor(),
          transition: 'all 0.3s ease',
          opacity: uploading || files.length >= maxFiles ? 0.6 : 1,
          '&:hover': {
            bgcolor: isDragActive ? 'primary.light' : 'grey.100',
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: getDropzoneColor(), mb: 2 }} />
        
        {uploading ? (
          <Typography variant="body1" color="text.secondary">
            Uploading files...
          </Typography>
        ) : files.length >= maxFiles ? (
          <Typography variant="body1" color="text.secondary">
            Maximum files reached ({maxFiles})
          </Typography>
        ) : isDragActive ? (
          <Typography variant="body1" color="primary.main">
            Drop files here...
          </Typography>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Drag & drop files here, or click to select
            </Typography>
            <Button variant="outlined" size="small">
              Choose Files
            </Button>
          </>
        )}
      </Box>

      {/* File Restrictions */}
      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label={`Max ${maxFiles} files`}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`Max ${apiUtils.formatFileSize(maxSize)} each`}
          size="small"
          variant="outlined"
        />
        <Chip
          label="PDF, DOC, Images"
          size="small"
          variant="outlined"
        />
      </Box>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Box sx={{ mt: 2 }}>
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <Box key={filename} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {filename}
                </Typography>
                {progress === 100 ? (
                  <CheckCircle color="success" sx={{ fontSize: 16 }} />
                ) : progress === -1 ? (
                  <Error color="error" sx={{ fontSize: 16 }} />
                ) : (
                  <Typography variant="caption">{progress}%</Typography>
                )}
              </Box>
              {progress > 0 && progress < 100 && (
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Uploaded Files ({files.length}/{maxFiles})
          </Typography>
          <List dense>
            {files.map((file) => (
              <ListItem
                key={file.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:last-child': { mb: 0 }
                }}
              >
                <ListItemIcon>
                  <Box sx={{ fontSize: 20 }}>
                    {getFileIcon(file.mimetype)}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption">
                        {apiUtils.formatFileSize(file.size)}
                      </Typography>
                      <Chip
                        label="Uploaded"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ height: 16, fontSize: '0.65rem' }}
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => removeFile(file)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Error Message */}
      {isDragReject && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Some files were rejected. Please check file type and size requirements.
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;
