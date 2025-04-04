import * as React from 'react';
import { extendTheme, styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import SendIcon from '@mui/icons-material/Send';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Grid from '@mui/material/Grid';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';



const NAVIGATION = [
  {
    kind: 'header',
    title: 'Applications',
  },
  {
    segment: 'dashboard',
    title: 'Credit/Debit',
    content: {
      heading: "Welcome to Credit/Debit Dashboard",
      message: "Manage your financial transactions here.",
      description: "Track all your credits and debits in one place."
    },
    url: 'credit/debit',
    icon: <DashboardIcon />,
  },
  {
    segment: 'recipient',
    title: 'Create Trip',
    content: {
      heading: "Welcome to Add Recipient Dashboard",
      message: "Manage your financial transactions here.",
      description: "Track all your credits and debits in one place."
    },
    url: 'ar',
    icon: <SendIcon />,
  },
  {
    segment: 'orders',
    title: 'Add Expense',
    content: {
      heading: "Expense Management",
      message: "Add and categorize your expenses.",
      description: "Keep track of where your money goes."
    },
    url: 'orders',
    icon: <ShoppingCartIcon />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Records',
  },
  {
    segment: 'expenses',
    title: 'Your Expenses',
    content: {
      heading: "Expense Reports",
      message: "View detailed expense analytics.",
      description: "Analyze your spending patterns over time."
    },
    url: 'expenses',
    icon: <BarChartIcon />,
    children: [
            
          ]
  }
];

const demoTheme = extendTheme({
  colorSchemes: { light: true, dark: true },
  colorSchemeSelector: 'class',
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

const InputField = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '12px',
  borderRadius: '4px',
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: '16px',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  border: 'none',
  borderRadius: '4px',
  padding: '12px 24px',
  cursor: 'pointer',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabled,
    cursor: 'not-allowed'
  }
}));

export default function DashboardLayoutBasic(props) {
  
const [dynamicNavigation, setDynamicNavigation] = useState([]);
  const { window } = props;
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [currentSegment, setCurrentSegment] = useState('dashboard');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Trip Management
  const [tripName, setTripName] = useState('');
  const [participantEmails, setParticipantEmails] = useState('');
  const [trips, setTrips] = useState([]);
  const [tripLoading, setTripLoading] = useState(false);

  // Expense Management
  const [amount, setAmount] = useState('');
  const [selectedTrip, setSelectedTrip] = useState('');
  const [description, setDescription] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [shares, setShares] = useState({});


  useEffect(() => {
    const baseNav = [
      {
        kind: 'header',
        title: 'Applications',
      },
      {
        segment: 'dashboard',
        title: 'Credit/Debit',
        // ... (rest of dashboard config)
      },
      {
        segment: 'recipient',
        title: 'Create Trip',
        // ... (rest of recipient config)
      },
      {
        segment: 'orders',
        title: 'Add Expense',
        // ... (rest of orders config)
      },
      {
        kind: 'divider',
      },
      {
        kind: 'header',
        title: 'Records',
      },
      {
        segment: 'expenses',
        title: 'Your Expenses',
        content: {
          heading: "Expense Reports",
          message: "View detailed expense analytics.",
          description: "Analyze your spending patterns over time."
        },
        url: 'expenses',
        icon: <BarChartIcon />,
        children: trips.map(trip => ({
          segment: `expenses/${trip._id}`,
          title: trip.name,
          url: `expenses/${trip._id}`,
        }))
      }
    ];
    
    setDynamicNavigation(baseNav);
  }, [trips]); // Rebuild navigation when trips change

  











// Add this useEffect to load participants when trip is selected
useEffect(() => {
  const fetchParticipants = async () => {
    if (selectedTrip) {
      try {
        const response = await fetch(`http://localhost:3500/trips/${selectedTrip}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setParticipants(data.trip.participants);
          // Initialize shares
          const initialShares = {};
          data.trip.participants.forEach(p => {
            initialShares[p._id] = 0;
          });
          setShares(initialShares);
        }
      } catch (error) {
        setError("Failed to load trip details");
      }
    }
  };
  fetchParticipants();
}, [selectedTrip]);







  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3500/getmyprofile", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        if (data.success) {
          setUser({ name: data.user1, email: data.detail1 });
          fetchTrips();
        }
      } catch (error) {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const fetchTrips = async () => {
    try {
      const response = await fetch("http://localhost:3500/user/trips", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) setTrips(data.trips);
    } catch (error) {
      setError("Failed to load trips");
    }
  };
  

  const handleCreateTrip = async () => {
    if (!tripName || !participantEmails) {
      setError("Trip name and participant emails are required");
      return;
    }

    setTripLoading(true);
    try {
      const response = await fetch("http://localhost:3500/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tripName,
          participantEmails: participantEmails.split(',').map(e => e.trim())
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create trip");

      setSuccess(`Trip "${tripName}" created successfully!`);
      setTripName('');
      setParticipantEmails('');
      fetchTrips();
    } catch (error) {
      setError(error.message);
    } finally {
      setTripLoading(false);
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    
    if (!selectedTrip || !amount) {
      setError("Please fill all required fields");
      return;
    }

    setExpenseLoading(true);
    try {
      const response = await fetch("http://localhost:3500/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tripId: selectedTrip,
          amount: parseFloat(amount),
          description,
          shares
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add expense");

      setSuccess("Expense added successfully!");
      setAmount('');
      setDescription('');
      setSelectedTrip('');
      fetchTrips();
    } catch (error) {
      setError(error.message);
    } finally {
      setExpenseLoading(false);
    }
  };

  // useEffect(() => {
  //   if (selectedTrip) {
  //     fetch(`http://localhost:3500/trips/${selectedTrip}`, {
  //       credentials: "include"
  //     })
  //       .then(res => res.json())
  //       .then(data => {
  //         if (data.success) {
  //           setParticipants(data.trip.participants);
  //           const initialShares = {};
  //           data.trip.participants.forEach(p => {
  //             initialShares[p._id] = 0;
  //           });
  //           setShares(initialShares);
  //         }
  //       });
  //   }
  // }, [selectedTrip]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </div>
  );

  return (
    <AppProvider 
      navigation={NAVIGATION} 
      router={{
        pathname: `/${currentSegment}`,
        searchParams: new URLSearchParams(),
        navigate: (path) => setCurrentSegment(path.split('/').pop()),
      }}
      theme={demoTheme} 
      window={window}  
      title={"TravFin"}
    >
      <DashboardLayout title="TravFin">
        <PageContainer>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <div style={{ padding: '16px' }}>
                <h2>Hello <span style={{ fontWeight: 'bold' }}>{user.name}</span>!</h2>
                <p>Email: {user.email}</p>
                
                {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}
              </div>
            </Grid>

            {currentSegment === 'dashboard' && (
              <Grid item xs={12}>
                <div style={{ display: 'flex', gap: '32px', margin: '24px 0'}}>
                  <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', flex: 1 }}>
                    <h3 style={{ margin: 0, color: '#2e7d32' }}>Total Owned</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold',color: '#000000' }}>₹0.00</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', flex: 1 }}>
                    <h3 style={{ margin: 0, color: '#d32f2f' }}>Total Owed</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold',color: '#000000'}}>₹0.00</p>
                  </div>
                </div>

                <div style={{ margin: '24px 0' }}>
                  <h3>Your Trips</h3>
                  {trips.length > 0 ? (
                    <ul>
                      {trips.map(trip => (
                        <li key={trip._id} style={{ marginBottom: '8px' }}>
                          {trip.name} - {trip.participants.length} participants
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No trips yet. Create one to get started!</p>
                  )}
                </div>
              </Grid>
            )}

            {currentSegment === 'recipient' && (
              <Grid item xs={12}>
                <div style={{ padding: '16px' }}>
                  <h2>Create New Trip</h2>
                  <InputField
                    placeholder="Trip Name"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                  />
                  <InputField
                    placeholder="Participant Emails (comma separated)"
                    value={participantEmails}
                    onChange={(e) => setParticipantEmails(e.target.value)}
                  />
                  <StyledButton 
                    onClick={handleCreateTrip}
                    disabled={tripLoading}
                  >
                    {tripLoading ? <CircularProgress size={24} /> : "Create Trip"}
                  </StyledButton>
                </div>
              </Grid>
            )}

            {currentSegment === 'orders' && (
              <Grid item xs={12}>
                <div style={{ padding: '16px' }}>
                  <h2>Add New Expense</h2>
                  <form onSubmit={handleSubmitExpense}>
                    <InputField 
                      placeholder="Enter amount" 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />

                    <select
                      value={selectedTrip}
                      onChange={(e) => setSelectedTrip(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '16px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                      required
                    >
                      <option value="">Select Trip</option>
                      {trips.map(trip => (
                        <option key={trip._id} value={trip._id}>{trip.name} ({new Date(trip.createdAt).toLocaleDateString()})</option>
                      ))}
                    </select>

                    <textarea
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '16px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        minHeight: '100px'
                      }}
                    />

                    {participants.map(participant => (
                      <div key={participant._id} style={{ marginBottom: '16px' }}>
                        <label>{participant.name || participant.email}</label>
                        <InputField
                          type="number"
                          placeholder="Amount"
                          value={shares[participant._id] || 0}
                          onChange={(e) => setShares(prev => ({
                            ...prev,
                            [participant._id]: parseFloat(e.target.value) || 0
                          }))}
                        />
                      </div>
                    ))}

                    <StyledButton 
                      type="submit"
                      disabled={expenseLoading}
                    >
                      {expenseLoading ? <CircularProgress size={24} /> : "Add Expense"}
                    </StyledButton>
                  </form>
                </div>
              </Grid>
            )}

            {currentSegment === 'expenses' && (
              <Grid item xs={12}>
                <div style={{ padding: '16px' }}>
                  <h2>Expense History</h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ padding: '12px', textAlign: 'left',color:'#000000' }}>Date</th>
                          <th style={{ padding: '12px', textAlign: 'left',color:'#000000' }}>Amount</th>
                          <th style={{ padding: '12px', textAlign: 'left',color:'#000000' }}>Trip</th>
                          <th style={{ padding: '12px', textAlign: 'left',color:'#000000' }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((expense, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>
                              {new Date(expense.date).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '12px' }}>₹{expense.amount}</td>
                            <td style={{ padding: '12px' }}>{expense.tripName}</td>
                            <td style={{ padding: '12px' }}>{expense.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Grid>
            )}
          </Grid>
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}

