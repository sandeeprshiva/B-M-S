import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UsersList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await usersAPI.getAll();
        setUsers(res.data || []);
      } catch (e) {}
    };
    load();
  }, []);

  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  const columns = [
    { key: 'username', title: 'Username' },
    { key: 'name', title: 'Name' },
    { key: 'role', title: 'Role' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Users</h2>
        <Link to="/users/new"><Button>Add User</Button></Link>
      </div>
      <Card>
        <Table
          columns={columns}
          data={users}
          renderActions={(row) => (
            <Link to={`/users/${row.id}`} className="text-primary-600 hover:underline">Edit</Link>
          )}
        />
      </Card>
    </div>
  );
};

export default UsersList;
