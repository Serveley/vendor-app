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
    <Box>
      <AppBar position="fixed">
        <Toolbar>
          <StoreIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Serveley Vendor Portal
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">{vendor.businessName || vendor.name}</Typography>
            <IconButton onClick={handleProfileMenuOpen} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
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
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); onLogout(); }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography>Logout</Typography>
        </MenuItem>
      </Menu>

      <Container sx={{ mt: 10, mb: 4 }}>
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Business
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {vendor.businessName || vendor.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Services Enabled
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {enabledCount} / {totalServices}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={profile?.isActive ? 'Active' : 'Inactive'}
                  color={profile?.isActive ? 'success' : 'error'}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab icon={<ServiceIcon />} label="My Services" />
            <Tab icon={<StoreIcon />} label="Profile" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Manage Your Services
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Toggle services on/off to control which services you offer to customers
            </Typography>
            
            {loading ? (
              <CircularProgress />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service._id || service.service?._id}>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {service.service?.name || 'Unknown Service'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={service.service?.category || 'N/A'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={service.enabled ? <ActiveIcon /> : <InactiveIcon />}
                          label={service.enabled ? 'Enabled' : 'Disabled'}
                          color={service.enabled ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={service.enabled}
                          onChange={(e) => handleServiceToggle(service.service._id, e.target.checked)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
