
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, Calendar } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  status?: string;
  employee_id?: string;
}

interface UsersTableProps {
  users: UserProfile[];
}

export const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status?: string) => {
    const statusValue = status || 'active';
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      active: 'نشط',
      inactive: 'غير نشط',
      suspended: 'معلق'
    };

    return (
      <Badge className={styles[statusValue as keyof typeof styles] || 'bg-gray-100 text-gray-800'}>
        {labels[statusValue as keyof typeof labels] || statusValue}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(user.full_name || 'مستخدم')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{user.full_name || 'مستخدم'}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      تاريخ التسجيل: {new Date(user.created_at).toLocaleDateString('ar-SA')}
                    </div>
                    {user.employee_id && (
                      <div className="text-sm text-gray-500">
                        رقم الموظف: {user.employee_id}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
