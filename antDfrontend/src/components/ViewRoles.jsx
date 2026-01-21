import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  Form,
  Input,
  Button, 
  Select,
  DatePicker,
  Table,
  Space, 
  Typography, 
  App,
  AutoComplete,
  Descriptions,
  Avatar,
  Modal,
  Tag
} from 'antd';
import { 
  SearchOutlined, 
  HomeOutlined,
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;

function ViewRoles() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  
  const searchParams = new URLSearchParams(location.search);
  const empIdFromUrl = searchParams.get('empId');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [roles, setRoles] = useState([]);
  const [directorates, setDirectorates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDirectorates();
  }, []);

  useEffect(() => {
    if (empIdFromUrl) {
      handleSearchWithId(empIdFromUrl);
    }
  }, [empIdFromUrl]);

  const fetchDirectorates = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/directorates');
      setDirectorates(response.data);
    } catch (err) {
      message.error('Failed to fetch directorates');
    }
  };

  const fetchDivisions = async (directorateId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/divisions/by-directorate/${directorateId}`
      );
      setDivisions(response.data);
    } catch (err) {
      message.error('Failed to fetch divisions');
    }
  };

  const handleDirectorateChange = (value) => {
    form.setFieldValue('division', undefined);
    if (value) {
      fetchDivisions(value);
    } else {
      setDivisions([]);
    }
  };

  // Fetch initial employees when search bar is focused
  const handleSearchFocus = async () => {
    if (searchResults.length === 0 && !searchQuery) {
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
        console.error('Failed to fetch initial employees:', error);
      }
    }
  };

  const handleSearchChange = async (value) => {
    setSearchQuery(value);

    if (!value || value.length < 2) {
      setSearchResults([]);
      setOptions([]);
      return;
    }

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
      console.error('Search error:', error);
    }
  };

  const handleSearchWithId = async (empId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/employees/${empId}`
      );
      if (response.data) {
        handleSelectEmployee(response.data);
      }
    } catch (error) {
      message.error('Employee not found');
    }
  };

  const handleSelectEmployee = async (employee) => {
    setSelectedEmployee(employee);
    setSearchQuery(employee.empName);
    setOptions([]);
    await fetchRolesForEmployee(employee.empId);
  };

  const fetchRolesForEmployee = async (empId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/employees/${empId}/roles`
      );
      setRoles(response.data);
    } catch (error) {
      console.error('Fetch roles error:', error);
      setRoles([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setOptions([]);
    setSelectedEmployee(null);
    setRoles([]);
    form.resetFields();
  };

  const onFinish = async (values) => {
    if (!selectedEmployee) {
      message.error('Please select an employee first');
      return;
    }

    setLoading(true);

    const payload = {
      empId: selectedEmployee.empId,
      roleName: values.roleName,
      roleNumber: values.roleNumber,
      fromDate: values.fromDate.format('YYYY-MM-DD'),
      toDate: values.toDate ? values.toDate.format('YYYY-MM-DD') : null,
      directorate: { directorateId: values.directorate },
      division: { divisionId: values.division }
    };

    try {
      if (editingRoleId) {
        await axios.put(
          `http://localhost:8080/api/employees/roles/${editingRoleId}`,
          payload
        );
        message.success('Role updated successfully!');
      } else {
        await axios.post(
          `http://localhost:8080/api/employees/${selectedEmployee.empId}/roles`,
          payload
        );
        message.success('Role added successfully!');
      }
      form.resetFields();
      setEditingRoleId(null);
      await fetchRolesForEmployee(selectedEmployee.empId);
    } catch (error) {
      console.error('Save role error:', error);
      message.error('Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role) => {
    setEditingRoleId(role.roleId);
    form.setFieldsValue({
      roleName: role.roleName,
      roleNumber: role.roleNumber,
      fromDate: dayjs(role.fromDate),
      toDate: role.toDate ? dayjs(role.toDate) : null,
      directorate: role.directorate?.directorateId,
      division: role.division?.divisionId
    });
    
    if (role.directorate?.directorateId) {
      fetchDivisions(role.directorate.directorateId);
    }
  };

  const handleDelete = (roleId) => {
    Modal.confirm({
      title: 'Delete Role',
      content: 'Are you sure you want to delete this role?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:8080/api/employees/roles/${roleId}`);
          message.success('Role deleted successfully!');
          await fetchRolesForEmployee(selectedEmployee.empId);
        } catch (error) {
          console.error('Delete role error:', error);
          message.error('Failed to delete role');
        }
      }
    });
  };

  const cancelEdit = () => {
    form.resetFields();
    setEditingRoleId(null);
  };

  const rolesColumns = [
    {
      title: 'Role Name',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: 'Role Number',
      dataIndex: 'roleNumber',
      key: 'roleNumber',
    },
    {
      title: 'From Date',
      dataIndex: 'fromDate',
      key: 'fromDate',
    },
    {
      title: 'To Date',
      dataIndex: 'toDate',
      key: 'toDate',
      render: (text) => text || <Tag color="green">Present</Tag>
    },
    {
      title: 'Directorate',
      dataIndex: ['directorate', 'name'],
      key: 'directorate',
      render: (text) => text || '-'
    },
    {
      title: 'Division',
      dataIndex: ['division', 'name'],
      key: 'division',
      render: (text) => text || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.roleId)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1em'
        }}>
          <Title 
            level={2} 
            style={{ 
              color: '#ffffff', 
              margin: 0,
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            🎭 Roles Management
          </Title>
          <Button
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            size="large"
            style={{
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}
          >
            Home
          </Button>
        </div>

        {/* Search Section */}
        <Card 
          style={{ 
            borderRadius: 20, 
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            background: 'rgba(255, 255, 255, 0.98)'
          }}
        >
          <Space.Compact style={{ width: '100%' }} size="large">
            <AutoComplete
              value={searchQuery}
              options={options}
              style={{ width: '100%' }}
              onSearch={handleSearchChange}
              onFocus={handleSearchFocus}
              onSelect={(value, option) => handleSelectEmployee(option.employee)}
              placeholder="Search employee by ID or Name (Press Enter)"
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
              />
            </AutoComplete>
          </Space.Compact>
        </Card>

        {/* Selected Employee Card */}
        {selectedEmployee && (
          <Card
            style={{
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.98)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5em' }}>
              <Avatar 
                size={80} 
                icon={<UserOutlined />}
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '2em'
                }}
              >
                {selectedEmployee.empName.charAt(0)}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Title level={3} style={{ margin: 0, marginBottom: '0.5em' }}>
                  {selectedEmployee.empName}
                </Title>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="ID">{selectedEmployee.empId}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{selectedEmployee.phone}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedEmployee.email || 'N/A'}</Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </Card>
        )}

        {/* Role Form */}
        {selectedEmployee && (
          <Card
            title={editingRoleId ? '✏️ Edit Role' : '➕ Add New Role'}
            style={{
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.98)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)'
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1em' }}>
                <Form.Item
                  label="Role Name"
                  name="roleName"
                  rules={[
                    { required: true, message: 'Role name is required' },
                    { min: 2, message: 'At least 2 characters' },
                    { max: 50, message: 'Maximum 50 characters' }
                  ]}
                >
                  <Input placeholder="Manager" size="large" />
                </Form.Item>

                <Form.Item
                  label="Role Number"
                  name="roleNumber"
                  rules={[
                    { required: true, message: 'Role number is required' },
                    { pattern: /^[0-9]+$/, message: 'Only numbers allowed' }
                  ]}
                >
                  <Input placeholder="123456" maxLength={6} size="large" />
                </Form.Item>

                <Form.Item
                  label="From Date"
                  name="fromDate"
                  rules={[{ required: true, message: 'From date is required' }]}
                >
                  <DatePicker 
                    format="DD-MM-YYYY" 
                    style={{ width: '100%' }}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="To Date"
                  name="toDate"
                >
                  <DatePicker 
                    format="DD-MM-YYYY" 
                    style={{ width: '100%' }}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Directorate"
                  name="directorate"
                  rules={[{ required: true, message: 'Directorate is required' }]}
                >
                  <Select
                    placeholder="Select Directorate"
                    onChange={handleDirectorateChange}
                    size="large"
                  >
                    {directorates.map(d => (
                      <Select.Option key={d.directorateId} value={d.directorateId}>
                        {d.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Division"
                  name="division"
                  rules={[{ required: true, message: 'Division is required' }]}
                >
                  <Select
                    placeholder="Select Division"
                    size="large"
                  >
                    {divisions.map(d => (
                      <Select.Option key={d.divisionId} value={d.divisionId}>
                        {d.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Form.Item style={{ marginTop: '1em', marginBottom: 0 }}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={editingRoleId ? <SaveOutlined /> : <PlusOutlined />}
                    loading={loading}
                    size="large"
                    style={{
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none'
                    }}
                  >
                    {editingRoleId ? 'Update Role' : 'Add Role'}
                  </Button>
                  {editingRoleId && (
                    <Button
                      onClick={cancelEdit}
                      size="large"
                      style={{ borderRadius: 12 }}
                    >
                      Cancel
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* Roles List */}
        {selectedEmployee && roles.length > 0 && (
          <Card
            title="📋 Role History"
            style={{
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.98)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)'
            }}
          >
            <Table
              columns={rolesColumns}
              dataSource={roles}
              rowKey="roleId"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        )}

        {selectedEmployee && roles.length === 0 && (
          <Card
            style={{
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.98)',
              textAlign: 'center',
              padding: '2em'
            }}
            >
            <Title level={4} type="secondary">No roles assigned yet.</Title>
        </Card>
        )}

      </Space>
    </div>
  );
}

export default ViewRoles;