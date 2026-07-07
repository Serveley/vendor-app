import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Store as StoreIcon,
  DesignServices as ServiceIcon,
  LocationOn as LocationIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import axios from 'axios';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Dashboard({ vendor, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    businessName: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    location: { coordinates: [0, 0] },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('vendorToken');
      const response = await axios.get('/api/vendors/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const profile = response.data.vendor;
        setProfile(profile);
        setProfileData({
          name: profile.name || '',
          phone: profile.phone || '',
          businessName: profile.businessName || '',
          address: profile.address || { street: '', city: '', state: '', zipCode: '' },
          location: profile.location || { coordinates: [0, 0] },
        });
        setServices(profile.services || []);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = async (serviceId, enabled) => {
    try {
      const token = localStorage.getItem('vendorToken');
      await axios.put(`/api/vendors/services/${serviceId}`, { enabled }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProfile();
      setMessage({ type: 'success', text: 'Service updated' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update service' });
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('vendorToken');
      await axios.put('/api/vendors/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const enabledCount = services.filter(s => s.enabled).length;
  const totalServices = services.length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
            <StoreIcon />
          </Box>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '800', fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.3px' }}>
            Serveley Portal
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" fontWeight="600" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {vendor.businessName || vendor.name}
            </Typography>
            <IconButton onClick={handleProfileMenuOpen} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontWeight: 'bold', fontSize: '0.875rem' }}>
                {(vendor.name || vendor.email)[0].toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{ sx: { borderRadius: '12px', mt: 0.5, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' } }}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); onLogout(); }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography fontWeight="500">Logout</Typography>
        </MenuItem>
      </Menu>

      <Container sx={{ mt: 12, mb: 4 }}>
        {message.text && (
          <Alert 
            severity={message.type} 
            variant="outlined"
            sx={{ mb: 3, borderRadius: '12px' }} 
            onClose={() => setMessage({ type: '', text: '' })}
          >
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography color="text.secondary" fontWeight="700" sx={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.75rem', mb: 1.5 }}>
                  Business Partner
                </Typography>
                <Typography variant="h5" fontWeight="800" sx={{ fontFamily: '"Outfit", sans-serif' }}>
                  {vendor.businessName || vendor.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography color="text.secondary" fontWeight="700" sx={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.75rem', mb: 1.5 }}>
                  Offerings Active
                </Typography>
                <Typography variant="h5" fontWeight="800" sx={{ fontFamily: '"Outfit", sans-serif', color: 'primary.main' }}>
                  {enabledCount} / {totalServices}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography color="text.secondary" fontWeight="700" sx={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.75rem', mb: 1.5 }}>
                  Account Status
                </Typography>
                <Chip
                  label={profile?.isActive ? 'Active Partner' : 'Suspended'}
                  sx={{ 
                    fontWeight: 'bold', 
                    borderRadius: '6px',
                    bgcolor: profile?.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: profile?.isActive ? '#10b981' : '#ef4444',
                    px: 1,
                    fontSize: '0.85rem'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: '16px', 
            border: '1px solid rgba(226, 232, 240, 0.8)', 
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={(e, v) => setTabValue(v)}
            sx={{
              borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: 'rgba(248, 250, 252, 0.5)',
              px: 2,
              '& .MuiTab-root': { py: 2, fontWeight: '600', textTransform: 'none', fontSize: '0.95rem' }
            }}
          >
            <Tab icon={<ServiceIcon fontSize="small" />} iconPosition="start" label="My Services" />
            <Tab icon={<StoreIcon fontSize="small" />} iconPosition="start" label="Profile Settings" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" fontWeight="700" sx={{ fontFamily: '"Outfit", sans-serif', mb: 0.5 }}>
              Offerings Setup
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Toggle the status of your services to manage what is visible on the client marketplace.
            </Typography>
            
            {loading ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer sx={{ borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'rgba(248, 250, 252, 0.8)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '700', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.8px' }}>Service Name</TableCell>
                      <TableCell sx={{ fontWeight: '700', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.8px' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: '700', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.8px' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: '700', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.8px', pr: 3 }}>Availability</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow 
                        key={service._id || service.service?._id}
                        sx={{ 
                          '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.02)' },
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell sx={{ py: 2.2 }}>
                          <Typography fontWeight="700" color="text.primary" sx={{ fontSize: '0.95rem' }}>
                            {service.service?.name || 'Unknown Service'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2.2 }}>
                          <Chip
                            label={service.service?.category || 'N/A'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: '600', borderRadius: '6px' }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2.2 }}>
                          <Chip
                            label={service.enabled ? 'Enabled' : 'Disabled'}
                            size="small"
                            sx={{ 
                              fontWeight: 'bold', 
                              borderRadius: '6px',
                              bgcolor: service.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                              color: service.enabled ? '#10b981' : '#64748b',
                              border: 'none'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.2, pr: 2 }}>
                          <Switch
                            checked={service.enabled}
                            color="primary"
                            onChange={(e) => handleServiceToggle(service.service._id, e.target.checked)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Name"
                  value={profileData.businessName}
                  onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={profileData.address.street}
                  onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, street: e.target.value } })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={profileData.address.city}
                  onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, city: e.target.value } })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={profileData.address.state}
                  onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, state: e.target.value } })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={profileData.address.zipCode}
                  onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, zipCode: e.target.value } })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
}

export default Dashboard;
