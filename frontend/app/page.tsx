'use client'

import React, { useState, useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import CircularProgress from '@mui/material/CircularProgress'
import { motion } from 'framer-motion'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

type JobStatus = 'pending' | 'in progress' | 'completed' | 'failed'
type Job = {
  id: string
  query: string
  status: JobStatus
  data: any
  created_at: string
}

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.0075em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '24px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
})

const MotionCard = motion(Card)
const MotionListItem = motion(ListItem)

export default function Component() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [previousSearches, setPreviousSearches] = useState<Job[]>([])
  const [isLoadingPreviousSearches, setIsLoadingPreviousSearches] = useState(true)
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const [openResultDialog, setOpenResultDialog] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (jobs.length > 0) {
      const pollInterval = setInterval(() => {
        jobs.forEach(job => {
          if (job.status === 'pending' || job.status === 'in progress') {
            fetch(`http://localhost:9000/api/result`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id: job.id }),
            })
              .then(response => response.json())
              .then(data => {
                setJobs(prevJobs => prevJobs.map(j =>
                  j.id === job.id ? { ...j, status: data.job.status, data: data.job.scrapedData[0].data } : j
                ))
              })
              .catch(error => console.error('Error polling job status:', error))
          }
        })
      }, 5000) // Poll every 5 seconds

      return () => clearInterval(pollInterval)
    }
  }, [jobs])

  useEffect(() => {
    const fetchPreviousSearches = async () => {
      try {
        const response = await fetch('http://localhost:9000/api/previous')
        if (!response.ok) {
          throw new Error('Failed to fetch previous searches')
        }
        const data = await response.json()
        setPreviousSearches(data.jobs)
      } catch (error) {
        console.error('Error fetching previous searches:', error)
        // Optionally set an error state here
      } finally {
        setIsLoadingPreviousSearches(false)
      }
    }

    fetchPreviousSearches()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const query = formData.get('query') as string

    try {
      const response = await fetch('http://localhost:9000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error('Job submission failed')
      }

      const data = await response.json()
      const newJob: Job = {
        id: data.id,
        query,
        status: 'pending',
        data: null,
        created_at: new Date().toISOString()
      }
      setJobs(prevJobs => [...prevJobs, newJob])
    } catch (error) {
      console.error('Error submitting job:', error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 600 }}>
          Twitter Web Scraper
        </Typography>

        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ mb: 4, overflow: 'hidden' }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  name="query"
                  placeholder="Enter search query"
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: <SearchIcon color="action" />,
                    sx: { borderRadius: '24px' }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Search'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </MotionCard>

        <Box sx={{ display: 'flex', gap: 4 }}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ flex: 1 }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>Job Status</Typography>
              {jobs.length === 0 ? (
                <Typography color="text.secondary">No jobs started in this session.</Typography>
              ) : (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {jobs.map((job, index) => (
                    <MotionListItem
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ListItemText
                        primary={job.query}
                        secondary={formatDate(job.created_at)}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={job.status}
                          color={job.status === 'completed' ? 'success' :
                            job.status === 'failed' ? 'error' :
                              'default'}
                          size="small"
                        />
                        {job.status === 'completed' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setOpenResultDialog(job.id)}
                          >
                            View Results
                          </Button>
                        )}
                      </Box>
                    </MotionListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            sx={{ flex: 1 }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>Previous Searches</Typography>
              {isLoadingPreviousSearches ? (
                <CircularProgress size={24} />
              ) : previousSearches.length === 0 ? (
                <Typography color="text.secondary">No previous searches found.</Typography>
              ) : (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {previousSearches.map((search, index) => (
                    <MotionListItem
                      key={index}
                      disablePadding
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Button
                        onClick={() => setOpenDialog(search.string)}
                        fullWidth
                        sx={{ justifyContent: 'flex-start', py: 1 }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Typography variant="body1">{search.string}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(search.created_at)}
                          </Typography>
                        </Box>
                      </Button>
                    </MotionListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </MotionCard>
        </Box>
        {previousSearches.map(search => (
          <Dialog
            key={search.id}
            open={openDialog === search.string}
            onClose={() => setOpenDialog(null)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>
              Search Results for "{search.string}"
              <IconButton
                aria-label="close"
                onClick={() => setOpenDialog(null)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="search results table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tweet</TableCell>
                      <TableCell align="right">Author</TableCell>
                      <TableCell align="right">Date</TableCell>
                      <TableCell align="right">Likes</TableCell>
                      <TableCell align="right">Retweets</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {search.scrapedData ? (
                      search.scrapedData[0].data.map((row: any, index: number) => (
                        <TableRow
                          key={index}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {row.tweetText}
                          </TableCell>
                          <TableCell align="right">{row.username}</TableCell>
                          <TableCell align="right">{formatDate(row.timestamp)}</TableCell>
                          <TableCell align="right">{row.likes}</TableCell>
                          <TableCell align="right">{row.retweets}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">No data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </Dialog>
        ))}
        {jobs.map(job => (
          <Dialog
            key={job.id}
            open={openResultDialog === job.id} // This should open when the job result dialog is selected
            onClose={() => setOpenResultDialog(null)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>
              Search Results for "{job.query}"
              <IconButton
                aria-label="close"
                onClick={() => setOpenResultDialog(null)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="search results table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tweet</TableCell>
                      <TableCell align="right">Author</TableCell>
                      <TableCell align="right">Date</TableCell>
                      <TableCell align="right">Likes</TableCell>
                      <TableCell align="right">Retweets</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {job.data ? (
                      job.data.map((row: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{row.tweetText}</TableCell>
                          <TableCell align="right">{row.username}</TableCell>
                          <TableCell align="right">{formatDate(row.timestamp)}</TableCell>
                          <TableCell align="right">{row.likes}</TableCell>
                          <TableCell align="right">{row.retweets}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">No data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </Dialog>
        ))}
      </Container>
    </ThemeProvider>
  )
}