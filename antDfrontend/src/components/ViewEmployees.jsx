import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  App, 
  Spin,
  Modal,
  Descriptions,
  Avatar,
  Row,
  Col,
  Tag
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  HomeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined as AddressIcon,
  ManOutlined,
  WomanOutlined,
  BankOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

function ViewEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const navigate = useNavigate();
  const { message, modal } = App.useApp();

  const fetchEmployees = useCallback(async (append = false, pageNum = 0) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/employees?page=${pageNum}&size=6`
      );
      const newEmployees = response.data.content || response.data;
      
      if (append) {
        setEmployees(prev => [...prev, ...newEmployees]);
      } else {
        setEmployees(newEmployees);
      }
      
      setHasMore(newEmployees.length === 6);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch employees');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [message]);

  useEffect(() => {
    fetchEmployees(false, 0);
  }, [fetchEmployees]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    setPage(nextPage);
    fetchEmployees(true, nextPage);
  }, [loadingMore, hasMore, page, fetchEmployees]);

  const handleUpdate = (empId) => {
    navigate(`/employees/update/${empId}`);
  };

  const handleDeleteClick = (emp) => {
    setDeletingEmployee(emp);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/employees/${deletingEmployee.empId}`);
      message.success('Employee deleted successfully!');
      setDeleteModalVisible(false);
      setDeletingEmployee(null);
      setPage(0);
      fetchEmployees(false, 0);
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete employee');
    }
  };

  const getGenderIcon = (gender) => {
    if (gender === 'MALE') return <ManOutlined style={{ color: '#1890ff' }} />;
    if (gender === 'FEMALE') return <WomanOutlined style={{ color: '#ff4d4f' }} />;
    return <UserOutlined />;
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
          Loading employees...
        </Title>
      </div>
    );
  }

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
            👥 Employee Directory
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

        {/* Employees Grid */}
        {employees.length === 0 ? (
          <Card 
            style={{ 
              textAlign: 'center', 
              padding: '3em',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.98)'
            }}
          >
            <Title level={4} type="secondary">No employees found.</Title>
          </Card>
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {employees.map((emp) => (
                <Col xs={24} sm={24} md={12} lg={12} xl={12} key={emp.empId}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 20,
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      background: 'rgba(255, 255, 255, 0.98)',
                      height: '100%'
                    }}
                    bodyStyle={{ padding: '1.5em' }}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      
                      {/* Header with Avatar */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1em',
                        paddingBottom: '1em',
                        borderBottom: '2px solid #f0f0f0'
                      }}>
                        <Avatar 
                          size={64} 
                          style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontSize: '1.8em',
                            fontWeight: 700
                          }}
                        >
                          {emp.empName.charAt(0)}
                        </Avatar>
                        <div style={{ flex: 1 }}>
                          <Title level={4} style={{ margin: 0, marginBottom: '0.2em' }}>
                            {emp.empName}
                          </Title>
                          <Tag 
                            color="purple" 
                            style={{ 
                              fontSize: '0.9em',
                              padding: '0.2em 0.8em',
                              borderRadius: 8
                            }}
                          >
                            ID: {emp.empId}
                          </Tag>
                        </div>
                      </div>

                      {/* Employee Details */}
                      <Descriptions column={1} size="small">
                        <Descriptions.Item 
                          label={<><MailOutlined /> Email</>}
                        >
                          {emp.email || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label={<><PhoneOutlined /> Phone</>}
                        >
                          {emp.phone}
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label={<><AddressIcon /> Address</>}
                        >
                          {emp.address}
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label={<>🎂 Age</>}
                        >
                          {emp.age}
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label={<>{getGenderIcon(emp.gender)} Gender</>}
                        >
                          {emp.gender}
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label={<><BankOutlined /> Directorate</>}
                        >
                          {emp.directorate?.name || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item 
                          label={<><ApartmentOutlined /> Division</>}
                        >
                          {emp.division?.name || '-'}
                        </Descriptions.Item>
                      </Descriptions>

                      {/* Action Buttons */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.8em',
                        paddingTop: '1em',
                        borderTop: '2px solid #f0f0f0'
                      }}>
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => handleUpdate(emp.empId)}
                          style={{ 
                            flex: 1,
                            height: 40,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none'
                          }}
                        >
                          Update
                        </Button>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteClick(emp)}
                          style={{ 
                            flex: 1,
                            height: 40,
                            borderRadius: 12
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Load More Button */}
            {hasMore && (
              <div style={{ textAlign: 'center', padding: '2em 0' }}>
                <Button
                  type="primary"
                  size="large"
                  loading={loadingMore}
                  onClick={loadMore}
                  style={{
                    height: 50,
                    minWidth: 200,
                    borderRadius: 16,
                    fontSize: '1.1em',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: 'none',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
                  }}
                >
                  {loadingMore ? 'Loading...' : 'Load More Employees'}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          title="Delete Employee"
          open={deleteModalVisible}
          onOk={handleDeleteConfirm}
          onCancel={() => {
            setDeleteModalVisible(false);
            setDeletingEmployee(null);
          }}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <p>
            Are you sure you want to delete employee <strong>{deletingEmployee?.empName}</strong> (ID: {deletingEmployee?.empId})?
          </p>
          <p style={{ color: '#ff4d4f' }}>
            This action cannot be undone.
          </p>
        </Modal>

      </Space>
    </div>
  );
}

export default ViewEmployees;