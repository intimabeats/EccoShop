import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Block as BlockIcon 
} from '@mui/icons-material';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  status?: 'active' | 'blocked'; // Adicionar status
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
          status: docSnap.data().status || 'active', // Valor padrão
        } as User));
        setUsers(usersList);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
      }
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        status: newStatus
      });
      
      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, status: newStatus } 
          : u
      ));
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Usuários
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Função</TableCell>
              <TableCell>Data de Criação</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{user.status || 'active'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bloquear/Desbloquear">
                    <IconButton onClick={() => handleToggleUserStatus(user)}>
                      <BlockIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton onClick={() => handleDeleteUser(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserManagement;
