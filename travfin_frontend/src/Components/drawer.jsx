import * as React from 'react';
import { extendTheme, styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
// import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
// import Grid from '@mui/material/Grid2';
import Grid from '@mui/material/Grid';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import Checkbox from '@mui/material/Checkbox';
import data from "./data.json";

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
  },
  {
    segment: 'integrations',
    title: 'Integrations',
    content: {
      heading: "Integration Hub",
      message: "Connect with other services.",
      description: "Expand your app's capabilities."
    },
    url: 'integrations',
    icon: <LayersIcon />,
  },
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

// Styled Components
const SkeletonWithInput = styled('div')(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height: `${height}px`,
  position: 'relative',
  width: '100%',
}));

// const InputField = styled('input')(({ theme }) => ({
//   backgroundColor: theme.palette.background.paper,
//   border: `1px solid ${theme.palette.divider}`,
//   borderRadius: theme.shape.borderRadius,
//   padding: theme.spacing(1),
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '100%',
//   boxSizing: 'border-box',
//   zIndex: 1,
//   '&:focus': {
//     outline: 'none',
//     borderColor: theme.palette.primary.main,
//   },
// }));








const InputField = styled('input')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.background.default  // Dark mode background
    : theme.palette.background.paper,   // Light mode background
  color: theme.palette.text.primary,    // Adjust text color for readability
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  zIndex: 1,
  transition: 'all 0.3s ease',  // Smooth transition when switching themes
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
  },
}));












const SkeletonWithButton = styled('div')(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height: `${height}px`,
  position: 'relative',
  width: '100%',
}));

const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  border: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  zIndex: 1,
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&:active': {
    backgroundColor: theme.palette.primary.light,
  },
  '&:focus': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
  },
}));

const SkeletonWithDropup = styled('div')(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height: `${height}px`,
  position: 'relative',
  width: '100%',
}));

const DropupButton = styled('button')(({ theme}) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.action.selected  // Dark mode background
    : theme.palette.action.hover,    // Light mode background
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  // position: 'absolute',
  position: 'relative',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  transition: 'background-color 0.3s ease', // Smooth transition on theme switch
  zIndex: 1,
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
  },
}));

const DropupList = styled('ul')(({ theme }) => ({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  width: '100%',
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.action.selected  // Dark mode background
    : theme.palette.action.hover,    // Light mode background
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  boxShadow: theme.shadows[2],
  margin: 0,
  padding: 0,
  listStyle: 'none',
  zIndex: 2,
  maxHeight: '200px',
  overflowY: 'auto',
}));

const DropupItem = styled('li')(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const CheckboxLabel = styled('span')({
  marginLeft: '8px',
});

const CheckboxDropup = ({ options, selected = [], onSelect, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropupRef = React.useRef(null);

  const handleCheckboxChange = (option) => {
    const isSelected = selected.some(item => item.value === option.value);
    if (isSelected) {
      onSelect(selected.filter(item => item.value !== option.value));
    } else {
      onSelect([...selected, option]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropupRef.current && !dropupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropupRef} style={{ position: 'relative' }}>
      <SkeletonWithDropup height={40}>
        <DropupButton onClick={() => setIsOpen(!isOpen)}>
          {selected.length > 0 
            ? selected.map(item => item.label).join(', ') 
            : placeholder}
          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
            ▼
          </span>
        </DropupButton>
      </SkeletonWithDropup>
      
      {isOpen && (
        <DropupList>
          {options.map((option) => (
            <DropupItem
              key={option.value}
              onClick={() => handleCheckboxChange(option)}
            >
              <Checkbox
                checked={selected.some(item => item.value === option.value)}
                onChange={() => handleCheckboxChange(option)}
                onClick={(e) => e.stopPropagation()}
                color="primary"
              />
              <CheckboxLabel>{option.label}</CheckboxLabel>
            </DropupItem>
          ))}
        </DropupList>
      )}
    </div>
  );
};

export default function DashboardLayoutBasic(props) {
  const { window } = props;
  const navigate = useNavigate();
  const [userf, setUserf] = useState({ name: "", e: "" });
  const [loading, setLoading] = useState(true);
  const [currentSegment, setCurrentSegment] = useState('dashboard');
  const [amount, setAmount] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [description, setDescription] = useState('');
  const [expenses, setExpenses] = useState(data.expenses);

  const findNavigationItem = (segment) => {
    for (const item of NAVIGATION) {
      if (item.segment === segment) return item;
    }
    return NAVIGATION.find(item => item.segment === 'dashboard');
  };

  const currentItem = findNavigationItem(currentSegment);

  const router = React.useMemo(() => {
    return {
      pathname: `/${currentSegment}`,
      searchParams: new URLSearchParams(),
      navigate: (path) => {
        const segment = path.split('/').pop();
        setCurrentSegment(segment);
      },
    };
  }, [currentSegment]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3500/getmyprofile", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setUserf({ name: data.user1, e: data.detail1 });
        } else {
          navigate("/signin");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newExpense = {
      amount,
      categories: selectedCategories.map(c => c.label),
      paymentMethod: paymentMethod?.label || '',
      description,
      date: new Date().toISOString()
    };
    
    setExpenses([...expenses, newExpense]);
    
    setAmount('');
    setSelectedCategories([]);
    setPaymentMethod(null);
    setDescription('');
    
    alert('Expense added successfully!');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <AppProvider 
      navigation={NAVIGATION} 
      router={router}
      theme={demoTheme} 
      window={window}  
      title="TraFin"
    >
      <DashboardLayout>
        <PageContainer>
          <Grid container spacing={2}>
            <Grid size={12}>
              <div>
                Hello <span className='font-bold'>{userf.name}</span>!
              </div>
              <p>Email: {userf.e}</p>
              
              <div style={{ margin: '16px 0' }}>
                {currentItem?.content ? (
                  <>
                    <h2 className="text-xl font-semibold">{currentItem.content.heading}</h2>
                    <p className="mt-2 text-gray-700">{currentItem.content.message}</p>
                    <p className="mt-1 text-sm text-gray-500">{currentItem.content.description}</p>
                  </>
                ) : (
                  <p>Select a section to view content</p>
                )}
              </div>
            </Grid>

            {currentSegment === 'dashboard' && (
              <Grid size={12}>
                <div style={{ display: 'flex', gap: '32px', margin: '24px 0'}}>
                  <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', flex: 1 }}>
                    <h3 style={{ margin: 0, color: '#2e7d32' }}>Total Owned</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold',color: 'black' }}>₹12,450.00</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', flex: 1 }}>
                    <h3 style={{ margin: 0, color: '#d32f2f' }}>Total Owed</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold',color: 'black' }}>₹8,250.00</p>
                  </div>
                </div>

                <div style={{ margin: '24px 0' }}>
                  <h3>Recent Transactions</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '12px', textAlign: 'left',color:'black' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left',color:'black' }}>Amount</th>
                        <th style={{ padding: '12px', textAlign: 'left',color:'black' }}>Type</th>
                        <th style={{ padding: '12px', textAlign: 'left',color:'black' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.map((transaction, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>{transaction.date}</td>
                          <td style={{ padding: '12px' }}>₹{transaction.amount}</td>
                          <td style={{ 
                            padding: '12px', 
                            color: transaction.type === 'credit' ? '#2e7d32' : '#d32f2f',
                            textTransform: 'capitalize'
                          }}>
                            {transaction.type}
                          </td>
                          <td style={{ padding: '12px' }}>{transaction.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Grid>
            )}

            {currentSegment === 'orders' && (
              <Grid size={12}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid size={4}>
                      <SkeletonWithInput height={40}>
                        <InputField 
                          placeholder="Enter amount" 
                          type="number"

                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                        />
                      </SkeletonWithInput>
                    </Grid>
                    
                    <Grid size={4} >
                      <CheckboxDropup
                        options={data.categories}
                        selected={selectedCategories}
                        onSelect={setSelectedCategories}
                        placeholder="Name of individual"
                      />
                    </Grid>
                    
                    <Grid size={4}>
                      <CheckboxDropup    
                                  
                        options={data.paymentMethods}
                        selected={paymentMethod ? [paymentMethod] : []}
                        onSelect={(selected) => setPaymentMethod(selected[0] || null)}
                        placeholder="Payment method"
                      />
                    </Grid>
                    
                    <Grid size={12}>
                      <SkeletonWithInput height={80} style={{ marginTop: '8px' }}>
                        <textarea 
                          style={{
                            width: '100%',
                            height: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            resize: 'none',
                            boxSizing: 'border-box',
                          }}
                          placeholder="Add description (optional)"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </SkeletonWithInput>
                    </Grid>
                    
                    <Grid size={12}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <div style={{ width: '200px' }}>
                          <SkeletonWithButton height={40}>
                            <StyledButton type="submit">
                              Add Transaction
                            </StyledButton>
                          </SkeletonWithButton>
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
            )}

            {currentSegment === 'expenses' && (
              <Grid size={12}>
                <div style={{ margin: '24px 0' }}>
                  <h2>Expense History</h2>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '12px', textAlign: 'left' ,color:'black'}}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left',color:'black' }}>Amount</th>
                        <th style={{ padding: '12px', textAlign: 'left',color:'black' }}>Category</th>
                        <th style={{ padding: '12px', textAlign: 'left',color:'black'}}>Payment Method</th>
                        <th style={{ padding: '12px', textAlign: 'left',color:'black' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px' }}>₹{expense.amount}</td>
                          <td style={{ padding: '12px' }}>{expense.categories.join(', ')}</td>
                          <td style={{ padding: '12px' }}>{expense.paymentMethod}</td>
                          <td style={{ padding: '12px' }}>{expense.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Grid>
            )}
          </Grid>
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}














