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
// import { 
//   Paper, 
//   Button, 

// } from '@material-ui/core';





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
  
const [dynamicNavigation, setDynamicNavigation] = useState(NAVIGATION);
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
  const [invitationEmails, setInvitationEmails] = useState('');
  const [trips, setTrips] = useState([]);
  const [tripLoading, setTripLoading] = useState(false);

  // Expense Management
  const [amount, setAmount] = useState('');
  const [selectedTrip, setSelectedTrip] = useState('');
  const [description, setDescription] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  // const [invitationsEmails, setinvitationsEmails] = useState([]);
  const [shares, setShares] = useState({});
  const [balanceData, setBalanceData] = useState({
    totalOwned: 0,
    totalOwed: 0,
    netResult: 0
  });


  const [tripTransactions, setTripTransactions] = useState([]);
  const [userTransactions, setUserTransactions] = useState({ youOwe: [], youAreOwed: [] });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  






  const handlePayment = async (transactionId, amount) => {
    navigate('/paymentprofile')
    setPaymentLoading(true);
    setSelectedTransactionId(transactionId);
    
    try {
      const response = await fetch("http://localhost:3500/payments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ transactionId, amount }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setSuccess("Payment processed successfully!");
        // Refresh trip transactions
        if (currentSegment.startsWith('expenses/')) {
          const tripId = currentSegment.split('/')[1];
          fetchTripTransactions(tripId);
        }
        fetchBalances(); // Update balances after payment
      }
    } catch (error) {
      setError(`Payment failed: ${error.message}`);
    } finally {
      setPaymentLoading(false);
      setSelectedTransactionId(null);
    }
  };

 // Update your fetchTripTransactions function to properly handle the data
 const fetchTripTransactions = async (tripId) => {
  try {
    console.log("Fetching transactions for trip:", tripId);
    const response = await fetch(`http://localhost:3500/transactions?tripId=${tripId}`, {
      method: 'GET',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        } 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Transaction data received:", data);
    
    if (data.success) {
      // Set all transactions
      setTripTransactions(data.transactions || []);
      
      // Make sure userTransactions has proper structure even if backend doesn't provide it
      const userTrans = data.userTransactions || { youOwe: [], youAreOwed: [] };
      setUserTransactions(userTrans);
      
      console.log("User transactions:", userTrans);
    } else {
      throw new Error(data.message || "Failed to load transactions");
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    setError(`Failed to load trip transactions: ${error.message}`);
  }
};
  



  // Replace both of your navigation useEffect hooks with this single implementation
  useEffect(() => {
    // Only run this when the trips array changes
    if (!Array.isArray(trips) || trips.length === 0) return;
    
    console.log("Building navigation with trips:", trips);
    
    const baseNav = [
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
        // Create children array with explicit indices for each trip
        children: trips.map((trip, index) => ({
          segment: `expenses/${trip._id}`,
          title: trip.name,
          url: `expenses/${trip._id}`,
          tripId: trip._id,
          // Adding a numeric index to ensure proper ordering
          order: index
        }))
      }
    ];
    
    console.log("Setting navigation with children:", baseNav[6].children);
    setDynamicNavigation(baseNav);
  }, [trips]);

  useEffect(() => {
    const updatedNavigation = NAVIGATION.map(item => {
      if (item.segment === 'expenses') {
        console.log("Building expenses navigation with trips:", trips);
        return {
          ...item,
          children: trips.map(trip => {
            console.log("Trip for nav:", trip);
            return {
              segment: `expenses/${trip._id}`,
              title: trip.name,
              url: `expenses/${trip._id}`,
            };
          })
        };
      }
      return item;
    });
    
    console.log("Updated navigation:", updatedNavigation);
    setDynamicNavigation(updatedNavigation);
  }, [trips]);





  useEffect(() => {
    if (currentSegment.startsWith('expenses/')) {
      const segments = currentSegment.split('/');
      if (segments.length >= 2) {
        const tripId = segments[segments.length - 1];
        
        // Check if the ID is valid
        if (tripId && /^[0-9a-fA-F]{24}$/.test(tripId)) {
          fetchTripTransactions(tripId);
        } else {
          console.error(`Invalid trip ID: "${tripId}"`);
          setError(`Invalid trip ID format. Please select a valid trip.`);
          
          // Optional: Navigate back to main expenses view
          // router.navigate('expenses');
        }
      }
    }
  }, [currentSegment]);







  // const router = {
  //   pathname: `/${currentSegment}`,
  //   searchParams: new URLSearchParams(),
  //   navigate: (path) => setCurrentSegment(path.split('/').pop()),
  // };



  const router = {
    pathname: `/${currentSegment}`,
    searchParams: new URLSearchParams(),
    navigate: (path) => {
      console.log("Navigating to:", path);
      // Extract segment from path properly
      let newSegment;
      if (path.startsWith('/')) {
        newSegment = path.substring(1);
      } else {
        newSegment = path;
      }
      console.log("Setting current segment to:", newSegment);
      setCurrentSegment(newSegment);
    },
  };





// Update expense fetching
useEffect(() => {
  const fetchExpenses = async (tripId) => {
    try {
      const response = await fetch(`http://localhost:3500/transactions?tripId=${tripId}`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) setExpenses(data.transactions);
    } catch (error) {
      setError("Failed to load expenses");
    }
  };

  if (currentSegment.startsWith('expenses/')) {
    const tripId = currentSegment.split('/')[1];
    fetchExpenses(tripId);
  }
}, [currentSegment]);






  

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
          fetchBalances(); // Add this line
        }
      } catch (error) {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // const fetchTrips = async () => {
  //   try {
  //     const response = await fetch("http://localhost:3500/user/trips", {
  //       method: "GET",
  //       credentials: "include",
  //     });
  //     const data = await response.json();
  //     if (data.success) setTrips(data.trips);
  //     fetchBalances(); // Refresh balances after any trip update



  //   } catch (error) {
  //     setError("Failed to load trips");
  //   }
  // };



const fetchTrips = async () => {
  try {
    console.log("Fetching trips...");
    const response = await fetch("http://localhost:3500/user/trips", {
      method: "GET",
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Fetched trips data:", data);
    
    if (data.success) {
      setTrips(data.trips);
      // Check for valid IDs
      data.trips.forEach(trip => {
        console.log(`Trip ${trip.name} has ID: ${trip._id}, valid format: ${/^[0-9a-fA-F]{24}$/.test(trip._id)}`);
      });
    }
    
    fetchBalances();
  } catch (error) {
    console.error("Error fetching trips:", error);
    setError("Failed to load trips");
  }
};








  const fetchBalances = async () => {
    try {
      const response = await fetch("http://localhost:3500/user/balances", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setBalanceData({
          youOwe: data.balances.youOwe || 0,
          youAreOwed: data.balances.youAreOwed || 0,
          netBalance: data.balances.netBalance || 0
        });
      }
    } catch (error) {
      setError("Failed to load balance data");
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
      fetchBalances(); // Add this line

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

 // Reset shares to 0 for all participants
  const resetShares = {};
  participants.forEach(p => {
    resetShares[p._id] = 0;
  });
  setShares(resetShares);
  
      fetchTrips();
      fetchBalances(); // Add this line
    } catch (error) {
      setError(error.message);
    } finally {
      setExpenseLoading(false);
    }
  };


  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </div>
  );









  const validateEmails = (emails) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails
      .split(',')
      .map(e => e.trim())
      .every(e => emailRegex.test(e));
  };

  
  





  const handlesendinvitation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!invitationEmails) {
      setError('Please enter at least one email address');
      return;
    }

    if (!validateEmails(invitationEmails)) {
      setError('Please enter valid email addresses');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3500/helloworld', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
         
        },
        credentials: 'include', 
        body: JSON.stringify({ participantEmails: invitationEmails })
      });

      const data = await response.json();


      
    
    if (response.status === 401 || response.status === 403) {
      localStorage.clear();
      navigate('/login');
      return; // Important to prevent further execution
    }
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send invitations');
      }

      setSuccess(data.message);
      setInvitationEmails('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };







  return (
    <AppProvider 
      navigation={dynamicNavigation} 
      router={router}
      theme={demoTheme} 
      window={window}  
      branding={{
        logo: <img src="favicon.ico" alt="MUI logo" />,
        title: 'TravFin',
        
      }}
    > 
   
      <DashboardLayout title="TravFin">
        <PageContainer >
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
                    <h3 style={{ margin: 0, color: '#d32f2f' }}>Owed</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold',color: '#000000' }}>₹{(balanceData?.youOwe || 0).toFixed(2)}</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', flex: 1 }}>
                    <h3 style={{ margin: 0, color: '#2e7d32' }}>Owned</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold',color: '#000000'}}>₹{(balanceData?.youAreOwed || 0).toFixed(2)}</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', flex: 1 }}>
                    <h3 style={{ margin: 0, color: '#0000FF' }}>Net {(balanceData?.netBalance || 0) >= 0 ? 'Owned' : 'Owed'}</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold',color: '#000000'}}>₹{Math.abs(balanceData?.netBalance || 0).toFixed(2)}</p>
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

                   <InputField
                    placeholder="Participant Email "
                    value={invitationEmails} // Add fallback empty string
                    onChange={(e) => setInvitationEmails(e.target.value)}
                    />

                  <StyledButton 
                    onClick={handlesendinvitation}
                    disabled={tripLoading}
                  >
                    {tripLoading ? <CircularProgress size={24} /> : "Send Invitation"}
                  </StyledButton>
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
                          value={shares[participant._id]}
                          onChange={(e) => {
                            const value = Math.max(0, parseFloat(e.target.value) || 0);
                            setShares(prev => ({
                              ...prev,
                              [participant._id]: value
                            }))
                          }}
                          inputProps={{ min: "0" }}
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











{(currentSegment === 'expenses' || currentSegment.startsWith('expenses/')) && (
  <Grid item xs={12}>
    <div style={{ padding: '16px' }}>
      {currentSegment.startsWith('expenses/') ? (
        <>
          <h2>Expenses for {
            trips.find(t => t._id === currentSegment.split('/')[1])?.name || "Selected Trip"
          }</h2>
          
          {/* Transaction Summary - Revamped with point-by-point display */}
          {/* <Paper elevation={2} style={{ padding: '24px', marginBottom: '24px', borderRadius: '8px' }}> */}
          <div>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Transaction Summary</h3>
            
            {/* You Owe Section */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ 
                color: '#d32f2f', 
                backgroundColor: '#ffebee', 
                padding: '10px 16px', 
                borderRadius: '4px',
                marginBottom: '16px'
              }}>You Owe</h4>
              
              {userTransactions.youOwe && userTransactions.youOwe.length > 0 ? (
                userTransactions.youOwe.filter(transaction => transaction.amount > 0)
                .map((transaction, index) => (
                  <div key={index} style={{ 
                    padding: '16px', 
                    marginBottom: '12px', 
                    backgroundColor: '#f8f8f8',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '16px', marginBottom: '4px' ,color:'#000000'}}>
                        You owe <strong style={{ color: '#d32f2f' }}>₹{transaction.amount.toFixed(2)}</strong> to <strong>{transaction.userToPayBack.name}</strong>
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        <span style={{ fontStyle: 'italic' }}>{transaction.description}</span> • {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                    <StyledButton
                      variant="contained" 
                      color="primary"
                      size="medium"
                      style={{ 
                        backgroundColor: '#1976d2', 
                        color: 'white',
                        minWidth: '80px'
                      }}
                      disabled={paymentLoading && selectedTransactionId === transaction.transactionId}
                      onClick={() => handlePayment(transaction.transactionId, transaction.amount)}

                   
                    >
                      {paymentLoading && selectedTransactionId === transaction.transactionId ? 
                        <CircularProgress size={20} color="inherit" /> : "Pay Now"}
                    </StyledButton>
                  </div>
                ))
              ) : (
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#f8f8f8', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  You don't owe anyone in this trip.
                </div>
              )}
            </div>
            
            {/* You Are Owed Section */}
            <div>
              <h4 style={{ 
                color: '#2e7d32', 
                backgroundColor: '#e8f5e9', 
                padding: '10px 16px', 
                borderRadius: '4px',
                marginBottom: '16px'
              }}>You Are Owed</h4>
              
              {userTransactions.youAreOwed && userTransactions.youAreOwed.length > 0 ? (
               userTransactions.youAreOwed.filter(transaction => transaction.amount > 0)
                .map((transaction, index) => (
                  <div key={index} style={{ 
                    padding: '16px', 
                    marginBottom: '12px', 
                    backgroundColor: '#f8f8f8',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: '16px', marginBottom: '4px' , color:'#000000'}}>
                      <strong>{transaction.userOwed.name}</strong> owes you <strong style={{ color: '#2e7d32' }}>₹{transaction.amount.toFixed(2)}</strong>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <span style={{ fontStyle: 'italic' }}>{transaction.description}</span> • {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#f8f8f8', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  No one owes you in this trip.
                </div>
              )}
            </div>
          {/* </Paper> */}
          </div>
          
          {/* All Transactions Section - Simplified List */}
          {/* <Paper elevation={2} style={{ padding: '24px', borderRadius: '8px' }}> */}

          <div>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>All Transactions</h3>
            
            {tripTransactions && tripTransactions.length > 0 ? (
              <div>
                {tripTransactions
                .map((transaction, idx) => (
                  <div key={idx} style={{ 
                    padding: '16px', 
                    marginBottom: '12px', 
                    backgroundColor: '#f8f8f8',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',

                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' , color:'#000000'}}>
                      <span style={{ fontWeight: 'bold' }}>{transaction.description}</span>
                      <span>₹{transaction.amount.toFixed(2)}</span>
                    </div>
                    
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      Paid by <strong>{transaction.payer.name}</strong> • {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div style={{ fontSize: '14px', color:'#000000' }}>
                      <strong>Split:</strong>
                      <div style={{ marginTop: '4px', paddingLeft: '8px' }}>
                        {transaction.shares.map((share, shareIdx) => (
                          <div key={shareIdx} style={{ 
                            padding: '6px 10px',
                            marginBottom: '4px', 
                            backgroundColor: share.user._id === user._id ? '#e3f2fd' : '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e0e0e0'
                          }}>
                            {share.user.name === user.name ? 'You' : share.user.name}: ₹{share.amount.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f8f8f8', 
                borderRadius: '8px',
                textAlign: 'center',
                color: '#666'
              }}>
                No transactions in this trip yet.
              </div>
            )}
          {/* </Paper> */}
          </div>
        </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#f8f8f8',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#666' }}>Select a trip from the sidebar to view expenses</h3>
          <p>Your trips will appear under "Your Expenses" in the sidebar</p>
        </div>
      )}
    </div>
  </Grid>
)}










          </Grid>
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}

