import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Input, 
  Button, 
  Table, 
  Card, 
  Space, 
  Typography, 
  App,
  AutoComplete
} from 'antd';
import { 
  SearchOutlined, 
  TeamOutlined, 
  SolutionOutlined,
  CloseCircleOutlined,
  HomeOutlined 
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Paragraph } = Typography;

function HomePage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  // Fetch initial employees when search bar is focused
  const handleSearchFocus = async () => {
    if (searchResults.length === 0 && !searchQuery) {
      setLoading(true);
      try {
        const response = await axios.get(
          'http://localhost:8080/api/employees/lookup?query=&page=0&size=20'
        );
        const allEmployees = response.data.content || response.data;
        setSearchResults(allEmployees);
        setOptions(
          allEmployees.map(emp => ({
            value: emp.empId,
            label: `${emp.empId} - ${emp.empName}`,
            employee: emp
          }))
        );
      } catch (error) {
        message.error('Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle search change
  const handleSearchChange = async (value) => {
    setSearchQuery(value);

    if (!value || value.length < 2) {
      setSearchResults([]);
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/employees/lookup?query=${encodeURIComponent(value)}&page=0&size=100`
      );
      const allEmployees = response.data.content || response.data;
      
      const filtered = allEmployees.filter(emp => 
        emp.empId.includes(value) || 
        emp.empName.toLowerCase().includes(value.toLowerCase())
      );
      
      setSearchResults(filtered);
      setOptions(
        filtered.map(emp => ({
          value: emp.empId,
          label: `${emp.empId} - ${emp.empName}`,
          employee: emp
        }))
      );
    } catch (error) {
      message.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      message.warning('Please enter at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/employees/lookup?query=${encodeURIComponent(searchQuery)}&page=0&size=100`
      );
      const allEmployees = response.data.content || response.data;
      
      const filtered = allEmployees.filter(emp => 
        emp.empId.includes(searchQuery) || 
        emp.empName.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (filtered.length > 0) {
        setSearchResults(filtered);
        message.success(`Found ${filtered.length} employee(s)`);
      } else {
        setSearchResults([]);
        message.error(`No employee found with: ${searchQuery}`);
      }
    } catch (error) {
      message.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setOptions([]);
  };

  // Handle employee click
  const handleEmployeeClick = (empId) => {
    navigate(`/roles?empId=${empId}`);
  };

  // Table columns
  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'empId',
      key: 'empId',
      render: (text) => (
        <Button 
          type="link" 
          onClick={() => handleEmployeeClick(text)}
          style={{ fontWeight: 'bold', padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'empName',
      key: 'empName',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Directorate',
      dataIndex: ['directorate', 'name'],
      key: 'directorate',
      render: (text) => text || '-',
    },
    {
      title: 'Division',
      dataIndex: ['division', 'name'],
      key: 'division',
      render: (text) => text || '-',
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginTop: '2em' }}>
          <Title 
            level={1} 
            style={{ 
              color: '#ffffff', 
              fontSize: 'clamp(2em, 5vw, 3.5em)',
              marginBottom: '0.3em',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            Employee Management System
          </Title>
          <Paragraph 
            style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '1.2em',
              marginBottom: 0
            }}
          >
            Manage employees and their roles efficiently
          </Paragraph>
        </div>

        {/* Search Section */}
        <Card 
          style={{ 
            borderRadius: 20, 
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Space.Compact style={{ width: '100%' }} size="large">
            <AutoComplete
              value={searchQuery}
              options={options}
              style={{ width: '100%' }}
              onSearch={handleSearchChange}
              onFocus={handleSearchFocus}
              onSelect={(value, option) => handleEmployeeClick(option.employee.empId)}
              placeholder="Search by Employee ID or Name (Press Enter to search)"
              size="large"
            >
              <Input
                prefix={<SearchOutlined style={{ color: '#667eea' }} />}
                suffix={
                  searchQuery && (
                    <CloseCircleOutlined 
                      onClick={clearSearch}
                      style={{ color: '#ef4444', cursor: 'pointer' }}
                    />
                  )
                }
                onPressEnter={handleSearchSubmit}
              />
            </AutoComplete>
            <Button 
              size="large" 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={handleSearchSubmit}
              loading={loading}
            >
              Search
            </Button>
          </Space.Compact>
        </Card>

        {/* Search Results Table */}
        {searchResults.length > 0 && (
          <Card 
            title={`Search Results (${searchResults.length} found)`}
            extra={
              <Button 
                type="text" 
                icon={<CloseCircleOutlined />} 
                onClick={clearSearch}
              >
                Clear
              </Button>
            }
            style={{ 
              borderRadius: 20,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
              background: 'rgba(255, 255, 255, 0.98)'
            }}
          >
            <Table
              columns={columns}
              dataSource={searchResults}
              rowKey="empId"
              pagination={{ 
                pageSize: 10,
                showTotal: (total) => `Total ${total} employees`,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50']
              }}
              loading={loading}
            />
          </Card>
        )}

        {/* Action Buttons */}
        <Space 
          size="large" 
          style={{ justifyContent: 'center', width: '100%', marginTop: '2em' }}
          wrap
        >
          <Button
            type="primary"
            size="large"
            icon={<TeamOutlined />}
            onClick={() => navigate('/employees')}
            style={{
              height: 70,
              fontSize: '1.2em',
              borderRadius: 16,
              minWidth: 240,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
            }}
          >
            View Employees
          </Button>

          <Button
            size="large"
            icon={<SolutionOutlined />}
            onClick={() => navigate('/roles')}
            style={{
              height: 70,
              fontSize: '1.2em',
              borderRadius: 16,
              minWidth: 240,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 10px 30px rgba(240, 147, 251, 0.4)'
            }}
          >
            View Roles
          </Button>
        </Space>

      </Space>
    </div>
  );
}

export default HomePage;