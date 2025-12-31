import React, { useState } from 'react';
import { dckNeonTheme } from '../styles/dckNeonTheme';

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  joinedDate: string;
  avatar?: string;
}

interface TeamManagementProps {
  onMemberAdded?: (member: TeamMember) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ onMemberAdded }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@dcktools.cop',
      role: 'Admin',
      permissions: ['Trade', 'Manage Wallets', 'Add Members'],
      joinedDate: '2024-01-15',
    },
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Trader',
    permissions: ['Trade'],
  });

  const roles = ['Admin', 'Trader', 'Analyst', 'Viewer'];
  const availablePermissions = [
    'Trade',
    'Manage Wallets',
    'View Portfolio',
    'Add Members',
    'Configure Bots',
    'Access Analytics',
  ];

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) {
      alert('Please fill in all required fields');
      return;
    }

    const member: TeamMember = {
      id: teamMembers.length + 1,
      ...newMember,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setTeamMembers([...teamMembers, member]);
    onMemberAdded?.(member);
    
    // Reset form
    setNewMember({
      name: '',
      email: '',
      role: 'Trader',
      permissions: ['Trade'],
    });
    setShowAddForm(false);
  };

  const handleRemoveMember = (id: number) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
    }
  };

  const togglePermission = (permission: string) => {
    setNewMember(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div style={{
      padding: '16px',
      color: dckNeonTheme.colors.textPrimary,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          color: dckNeonTheme.colors.neonCyan,
          textShadow: `0 0 15px ${dckNeonTheme.colors.neonCyan}80`,
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          👥 Team Members
        </h2>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '10px 20px',
            background: showAddForm 
              ? dckNeonTheme.colors.danger + '20'
              : `linear-gradient(135deg, ${dckNeonTheme.colors.neonCyan}80, ${dckNeonTheme.colors.neonPink}60)`,
            border: `1px solid ${showAddForm ? dckNeonTheme.colors.danger : dckNeonTheme.colors.neonCyan}`,
            borderRadius: '8px',
            color: dckNeonTheme.colors.textPrimary,
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: showAddForm ? 'none' : `0 0 15px ${dckNeonTheme.colors.neonCyan}60`,
            transition: 'all 0.2s ease',
          }}
        >
          {showAddForm ? '✕ Cancel' : '➕ Add Member'}
        </button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <div style={{
          padding: '20px',
          background: dckNeonTheme.colors.bgCard,
          border: `1px solid ${dckNeonTheme.colors.neonCyan}40`,
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: `0 0 20px ${dckNeonTheme.colors.neonCyan}20`,
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            color: dckNeonTheme.colors.neonPink,
            textShadow: `0 0 10px ${dckNeonTheme.colors.neonPink}60`,
          }}>
            Add New Team Member
          </h3>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: dckNeonTheme.colors.textSecondary,
                marginBottom: '6px',
              }}>
                Name *
              </label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Enter name"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: dckNeonTheme.colors.bg,
                  border: `1px solid ${dckNeonTheme.colors.border}`,
                  borderRadius: '6px',
                  color: dckNeonTheme.colors.textPrimary,
                  fontSize: '13px',
                  outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = dckNeonTheme.colors.neonCyan}
                onBlur={(e) => e.target.style.borderColor = dckNeonTheme.colors.border}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: dckNeonTheme.colors.textSecondary,
                marginBottom: '6px',
              }}>
                Email *
              </label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="Enter email"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: dckNeonTheme.colors.bg,
                  border: `1px solid ${dckNeonTheme.colors.border}`,
                  borderRadius: '6px',
                  color: dckNeonTheme.colors.textPrimary,
                  fontSize: '13px',
                  outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = dckNeonTheme.colors.neonCyan}
                onBlur={(e) => e.target.style.borderColor = dckNeonTheme.colors.border}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: dckNeonTheme.colors.textSecondary,
                marginBottom: '6px',
              }}>
                Role
              </label>
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: dckNeonTheme.colors.bg,
                  border: `1px solid ${dckNeonTheme.colors.border}`,
                  borderRadius: '6px',
                  color: dckNeonTheme.colors.textPrimary,
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: dckNeonTheme.colors.textSecondary,
                marginBottom: '8px',
              }}>
                Permissions
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
              }}>
                {availablePermissions.map(permission => (
                  <label
                    key={permission}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      background: newMember.permissions.includes(permission)
                        ? dckNeonTheme.colors.neonCyan + '20'
                        : dckNeonTheme.colors.bg,
                      border: `1px solid ${newMember.permissions.includes(permission)
                        ? dckNeonTheme.colors.neonCyan
                        : dckNeonTheme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newMember.permissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      style={{ cursor: 'pointer' }}
                    />
                    {permission}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddMember}
              style={{
                marginTop: '8px',
                padding: '12px',
                background: `linear-gradient(135deg, ${dckNeonTheme.colors.success}80, ${dckNeonTheme.colors.neonCyan}60)`,
                border: `1px solid ${dckNeonTheme.colors.success}`,
                borderRadius: '8px',
                color: dckNeonTheme.colors.textPrimary,
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: `0 0 15px ${dckNeonTheme.colors.success}40`,
                transition: 'all 0.2s ease',
              }}
            >
              ✓ Add Team Member
            </button>
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div style={{
        display: 'grid',
        gap: '12px',
      }}>
        {teamMembers.map(member => (
          <div
            key={member.id}
            style={{
              padding: '16px',
              background: dckNeonTheme.colors.bgCard,
              border: `1px solid ${dckNeonTheme.colors.border}`,
              borderRadius: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px',
            }}>
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: dckNeonTheme.colors.textPrimary,
                  marginBottom: '4px',
                }}>
                  {member.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: dckNeonTheme.colors.textSecondary,
                }}>
                  {member.email}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  padding: '4px 12px',
                  background: dckNeonTheme.colors.neonPink + '20',
                  border: `1px solid ${dckNeonTheme.colors.neonPink}`,
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: dckNeonTheme.colors.neonPink,
                }}>
                  {member.role}
                </span>
                
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  style={{
                    padding: '6px 10px',
                    background: dckNeonTheme.colors.danger + '20',
                    border: `1px solid ${dckNeonTheme.colors.danger}`,
                    borderRadius: '6px',
                    color: dckNeonTheme.colors.danger,
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '8px',
            }}>
              {member.permissions.map(permission => (
                <span
                  key={permission}
                  style={{
                    padding: '4px 8px',
                    background: dckNeonTheme.colors.neonCyan + '10',
                    border: `1px solid ${dckNeonTheme.colors.neonCyan}40`,
                    borderRadius: '6px',
                    fontSize: '10px',
                    color: dckNeonTheme.colors.neonCyan,
                  }}
                >
                  {permission}
                </span>
              ))}
            </div>

            <div style={{
              fontSize: '11px',
              color: dckNeonTheme.colors.textMuted,
            }}>
              Joined: {new Date(member.joinedDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: dckNeonTheme.colors.textSecondary,
          background: dckNeonTheme.colors.bgCard,
          border: `1px solid ${dckNeonTheme.colors.border}`,
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
          <div>No team members yet</div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
            Click "Add Member" to invite someone to your team
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
