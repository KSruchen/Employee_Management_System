import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Form,
  Input,
  Button, 
  Select,
  DatePicker,
  Space, 
  Typography, 
  App,
  Spin
} from 'antd';
import { 
  SaveOutlined, 
  CloseOutlined,
  UserOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

function UpdateEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [directorates, setDirectorates] = useState([]);
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    fetchEmployee();
    fetchDirectorates();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/employees/${id}`);
      const emp = response.data;
      
      form.setFieldsValue({
        empName: emp.empName,
        email: emp.email,
        phone: emp.phone,
        address: emp.address,
        dob: emp.dob ? dayjs(emp.dob) : null,
        age: emp.age,
        gender: emp.gender,
        directorate: emp.directorate?.directorateId,
        division: emp.division?.divisionId
      });

      if (emp.directorate?.directorateId) {
        await fetchDivisions(emp.directorate.directorateId);
      }

      setLoading(false);
    } catch (error) {
      console.error('Fetch employee error:', error);
      message.error('Failed to fetch employee details');
      navigate('/employees');
    }
  };

  const fetchDirectorates = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/directorates');
      setDirectorates(response.data);
    } catch (error) {
      message.error('Failed to fetch directorates');
    }
  };

  const fetchDivisions = async (directorateId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/divisions/by-directorate/${directorateId}`
      );
      setDivisions(response.data);
    } catch (error) {
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

  const onFinish = async (values) => {
    setSubmitting(true);

    const payload = {
      empId: id,
      empName: values.empName,
      email: values.email || null,
      phone: values.phone,
      address: values.address,
      dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
      age: values.age,
      gender: values.gender,
      directorate: { directorateId: values.directorate },
      division: { divisionId: values.division }
    };

    try {
      await axios.put(`http://localhost:8080/api/employees/${id}`, payload);
      message.success('Employee updated successfully!');
      navigate('/employees');
    } catch (error) {
      console.error('Update error:', error);
      message.error('Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        gap: '1.5em'
      }}>
        <Spin size="large" />
        <Title level={4} style={{ color: '#ffffff', margin: 0 }}>
          Loading employee details...
        </Title>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
            ✏️ Update Employee
          </Title>
          <Button
            icon={<CloseOutlined />}
            onClick={() => navigate('/employees')}
            size="large"
            style={{
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}
          >
            Back
          </Button>
        </div>

        {/* Form Card */}
        <Card
          style={{
            borderRadius: 24,
            boxShadow: '0 12px 40px rgba(15, 23, 42, 0.2)',
            background: 'rgba(255, 255, 255, 0.98)'
          }}
          bodyStyle={{ padding: '2.5em' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1.5em' 
            }}>
              
              {/* Employee Name */}
              <Form.Item
                label="Employee Name"
                name="empName"
                rules={[
                  { required: true, message: 'Name is required' },
                  { min: 2, message: 'At least 2 characters' },
                  { max: 100, message: 'Maximum 100 characters' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="John Doe" 
                  size="large"
                />
              </Form.Item>

              {/* Email */}
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: 'email', message: 'Invalid email format' }
                ]}
              >
                <Input 
                  placeholder="john@example.com" 
                  size="large"
                />
              </Form.Item>

              {/* Phone */}
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: 'Phone is required' },
                  { pattern: /^[0-9]+$/, message: 'Only numbers allowed' },
                  { min: 10, message: 'At least 10 digits' },
                  { max: 15, message: 'Maximum 15 digits' }
                ]}
              >
                <Input 
                  placeholder="1234567890" 
                  size="large"
                />
              </Form.Item>

              {/* Date of Birth */}
              <Form.Item
                label="Date of Birth"
                name="dob"
              >
                <DatePicker 
                  format="DD-MM-YYYY"
                  style={{ width: '100%' }}
                  size="large"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>

              {/* Age */}
              <Form.Item
                label="Age"
                name="age"
                rules={[
                  { required: true, message: 'Age is required' },
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const age = parseInt(value);
                      if (isNaN(age) || age < 18 || age > 100) {
                        return Promise.reject('Age must be between 18 and 100');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input 
                  type="number"
                  placeholder="25" 
                  size="large"
                />
              </Form.Item>

              {/* Gender */}
              <Form.Item
                label="Gender"
                name="gender"
                rules={[{ required: true, message: 'Gender is required' }]}
              >
                <Select 
                  placeholder="Select Gender"
                  size="large"
                >
                  <Select.Option value="MALE">Male</Select.Option>
                  <Select.Option value="FEMALE">Female</Select.Option>
                  <Select.Option value="OTHER">Other</Select.Option>
                </Select>
              </Form.Item>

              {/* Directorate */}
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

              {/* Division */}
              <Form.Item
                label="Division"
                name="division"
                rules={[{ required: true, message: 'Division is required' }]}
              >
                <Select
                  placeholder="Select Division"
                  size="large"
                  disabled={!divisions.length}
                >
                  {divisions.map(d => (
                    <Select.Option key={d.divisionId} value={d.divisionId}>
                      {d.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Address - Full Width */}
              <Form.Item
                label="Address"
                name="address"
                rules={[
                  { required: true, message: 'Address is required' },
                  { min: 5, message: 'At least 5 characters' },
                  { max: 200, message: 'Maximum 200 characters' }
                ]}
                style={{ gridColumn: 'span 2' }}
              >
                <TextArea 
                  placeholder="123 Main St, City, Country" 
                  rows={3}
                  size="large"
                />
              </Form.Item>

            </div>

            {/* Action Buttons */}
            <Form.Item style={{ marginTop: '1.5em', marginBottom: 0 }}>
              <Space size="middle">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={submitting}
                  size="large"
                  style={{
                    minWidth: 150,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    height: 45
                  }}
                >
                  Update Employee
                </Button>
                <Button
                  onClick={() => navigate('/employees')}
                  size="large"
                  style={{
                    minWidth: 120,
                    borderRadius: 14,
                    height: 45
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

      </Space>
    </div>
  );
}

export default UpdateEmployee;