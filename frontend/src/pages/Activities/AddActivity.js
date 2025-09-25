import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Paper,
  IconButton,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Add,
  Delete,
  CloudUpload
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

import { activitiesAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import FileUpload from '../../components/Common/FileUpload';

// Validation schema
const activitySchema = yup.object().shape({
  title: yup.string().required('Title is required').max(200, 'Title too long'),
  description: yup.string().required('Description is required').max(1000, 'Description too long'),
  category: yup.string().required('Category is required'),
  organizer: yup.string().required('Organizer is required').max(200, 'Organizer name too long'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  location: yup.string().max(200, 'Location too long'),
  mode: yup.string().required('Mode is required'),
  credits: yup.number().min(0, 'Credits cannot be negative').max(10, 'Credits cannot exceed 10'),
  score: yup.number().min(0, 'Score cannot be negative').max(100, 'Score cannot exceed 100'),
  grade: yup.string().max(10, 'Grade too long'),
  learningOutcomes: yup.string().max(500, 'Learning outcomes too long'),
  skillsGained: yup.array().of(yup.string())
});

const categories = [
  { value: 'academic', label: 'Academic' },
  { value: 'research', label: 'Research' },
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'certification', label: 'Certification' },
  { value: 'internship', label: 'Internship' },
  { value: 'project', label: 'Project' },
  { value: 'competition', label: 'Competition' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'extracurricular', label: 'Extracurricular' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'publication', label: 'Publication' },
  { value: 'patent', label: 'Patent' },
  { value: 'award', label: 'Award' },
  { value: 'other', label: 'Other' }
];

const AddActivity = () => {
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(activitySchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      organizer: '',
      startDate: null,
      endDate: null,
      location: '',
      mode: 'offline',
      credits: 0,
      score: '',
      grade: '',
      learningOutcomes: '',
      skillsGained: []
    }
  });

  const watchedSkills = watch('skillsGained') || [];

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Format dates and add documents
      const formattedData = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        documents: documents.map(doc => ({
          name: doc.name,
          url: doc.url,
          fileType: doc.mimetype.startsWith('image/') ? 'image' : 
                   doc.mimetype === 'application/pdf' ? 'pdf' : 'document'
        }))
      };

      await activitiesAPI.createActivity(formattedData);
      
      toast.success('Activity created successfully!');
      window.location.href = '/activities';
      
    } catch (error) {
      console.error('Create activity error:', error);
      toast.error(error.response?.data?.message || 'Failed to create activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !watchedSkills.includes(skillInput.trim())) {
      setValue('skillsGained', [...watchedSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setValue('skillsGained', watchedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSkill();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => window.history.back()}
            sx={{ textTransform: 'none' }}
          >
            Back
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Add New Activity
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Main Form */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Activity Details
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Title */}
                    <Grid item xs={12}>
                      <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Activity Title *"
                            error={!!errors.title}
                            helperText={errors.title?.message}
                            placeholder="Enter a descriptive title for your activity"
                          />
                        )}
                      />
                    </Grid>

                    {/* Category and Mode */}
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.category}>
                            <InputLabel>Category *</InputLabel>
                            <Select {...field} label="Category *">
                              {categories.map((category) => (
                                <MenuItem key={category.value} value={category.value}>
                                  {category.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="mode"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Mode *</InputLabel>
                            <Select {...field} label="Mode *">
                              <MenuItem value="online">Online</MenuItem>
                              <MenuItem value="offline">Offline</MenuItem>
                              <MenuItem value="hybrid">Hybrid</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    {/* Organizer */}
                    <Grid item xs={12}>
                      <Controller
                        name="organizer"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Organizer/Institution *"
                            error={!!errors.organizer}
                            helperText={errors.organizer?.message}
                            placeholder="Name of the organizing institution or company"
                          />
                        )}
                      />
                    </Grid>

                    {/* Location */}
                    <Grid item xs={12}>
                      <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Location"
                            error={!!errors.location}
                            helperText={errors.location?.message}
                            placeholder="City, Country or Online platform"
                          />
                        )}
                      />
                    </Grid>

                    {/* Dates */}
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="startDate"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            label="Start Date *"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.startDate,
                                helperText: errors.startDate?.message
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="endDate"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            label="End Date *"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.endDate,
                                helperText: errors.endDate?.message
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12}>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={4}
                            label="Description *"
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            placeholder="Provide detailed description of the activity, what you did, and what you learned"
                          />
                        )}
                      />
                    </Grid>

                    {/* Learning Outcomes */}
                    <Grid item xs={12}>
                      <Controller
                        name="learningOutcomes"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={3}
                            label="Learning Outcomes"
                            error={!!errors.learningOutcomes}
                            helperText={errors.learningOutcomes?.message}
                            placeholder="What did you learn or achieve from this activity?"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Skills Section */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Skills Gained
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Add Skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      placeholder="e.g., React.js, Project Management, Public Speaking"
                    />
                    <Button
                      variant="outlined"
                      onClick={addSkill}
                      disabled={!skillInput.trim()}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      <Add />
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {watchedSkills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        onDelete={() => removeSkill(skill)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  
                  {watchedSkills.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Add skills you gained from this activity
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Documents Section */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Supporting Documents
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Upload certificates, completion letters, photos, or any other documents that validate your activity.
                  </Typography>
                  
                  <FileUpload
                    onFilesChange={setDocuments}
                    maxFiles={5}
                    label="Upload Certificates & Documents"
                    initialFiles={documents}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              {/* Academic Details */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Academic Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Controller
                        name="credits"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="number"
                            label="Credits"
                            error={!!errors.credits}
                            helperText={errors.credits?.message}
                            inputProps={{ min: 0, max: 10, step: 0.5 }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="score"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="number"
                            label="Score (%)"
                            error={!!errors.score}
                            helperText={errors.score?.message}
                            inputProps={{ min: 0, max: 100 }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="grade"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Grade"
                            error={!!errors.grade}
                            helperText={errors.grade?.message}
                            placeholder="A+, A, B+, etc."
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Your activity will be submitted for faculty approval. Make sure all information is accurate and upload supporting documents for faster verification.
                  </Alert>
                  
                  {documents.length > 0 && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      ✓ {documents.length} document{documents.length > 1 ? 's' : ''} uploaded for validation
                    </Alert>
                  )}
                  
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <LoadingSpinner size={20} showMessage={false} /> : <Save />}
                    sx={{ py: 1.5 }}
                  >
                    {isSubmitting ? 'Creating Activity...' : 'Create Activity'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default AddActivity;
