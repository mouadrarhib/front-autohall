// src/features/groupement/GroupementManagement.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { filialeApi } from '../../api/endpoints/filiale.api';
import { succursaleApi } from '../../api/endpoints/succursale.api';
import { MarqueManagement } from './MarqueManagement';
import { ModeleManagement } from './ModeleManagement';
import { VersionManagement } from './VersionManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`groupement-tabpanel-${index}`}
      aria-labelledby={`groupement-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const GroupementManagement: React.FC = () => {
  const [groupementType, setGroupementType] = useState<'Filiale' | 'Succursale'>('Filiale');
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Load sites based on groupement type
  useEffect(() => {
    loadSites();
  }, [groupementType]);

  // Reset selected site when groupement type changes
  useEffect(() => {
    setSelectedSiteId(null);
  }, [groupementType]);

  const loadSites = async () => {
  try {
    setLoading(true);
    setError(null);

    if (groupementType === 'Filiale') {
      const response = await filialeApi.listFiliales({ 
        active: true, 
        pageSize: 1000 
      });
      setSites(response.data || []);
    } else {
      const response = await succursaleApi.listSuccursales({ 
        onlyActive: true, 
        pageSize: 1000 
      });
      setSites(response.data || []);
    }
  } catch (err: any) {
    console.error('Failed to load sites:', err);
    setError(err.response?.data?.error || 'Failed to load sites');
  } finally {
    setLoading(false);
  }
};


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <BusinessIcon sx={{ fontSize: 40 }} color="primary" />
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Groupement Management
        </Typography>
      </Box>

      {/* Filter Card */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Select Site
          </Typography>
          <Grid container spacing={2}>
            {/* Groupement Type Selector */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={groupementType}
                  label="Type"
                  onChange={(e) => setGroupementType(e.target.value as 'Filiale' | 'Succursale')}
                >
                  <MenuItem value="Filiale">Filiale</MenuItem>
                  <MenuItem value="Succursale">Succursale</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Site Selector */}
            <Grid item xs={12} md={8}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>
                  {groupementType === 'Filiale' ? 'Select Filiale' : 'Select Succursale'}
                </InputLabel>
                <Select
                  value={selectedSiteId || ''}
                  label={groupementType === 'Filiale' ? 'Select Filiale' : 'Select Succursale'}
                  onChange={(e) => setSelectedSiteId(Number(e.target.value))}
                >
                  {loading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : sites.length === 0 ? (
                    <MenuItem disabled>No {groupementType.toLowerCase()}s available</MenuItem>
                  ) : (
                    sites.map((site) => (
                      <MenuItem key={site.id} value={site.id}>
                        <Box display="flex" alignItems="center" gap={1} width="100%">
                          <span>{site.name}</span>
                          {site.active && (
                            <Chip label="Active" size="small" color="success" sx={{ ml: 'auto' }} />
                          )}
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Content Tabs */}
      {!selectedSiteId ? (
        <Alert severity="info">
          Please select a {groupementType.toLowerCase()} to manage marques, modèles, and versions
        </Alert>
      ) : (
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="groupement management tabs"
              sx={{ px: 2 }}
            >
              <Tab label="Marques" />
              <Tab label="Modèles" />
              <Tab label="Versions" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <MarqueManagement
              groupementType={groupementType}
              siteId={selectedSiteId}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <ModeleManagement
              groupementType={groupementType}
              siteId={selectedSiteId}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <VersionManagement
              groupementType={groupementType}
              siteId={selectedSiteId}
            />
          </TabPanel>
        </Card>
      )}
    </Box>
  );
};
