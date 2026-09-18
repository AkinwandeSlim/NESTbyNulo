'use client';

import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Shield, Bell, CreditCard, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/nest-utils';

interface ProfileViewProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
    status: string;
    createdAt?: string;
  };
}

export default function ProfileView({ user }: ProfileViewProps) {
  const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const userInitials = user.firstName?.[0] || user.email[0];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-nest-primary/10 border-2 border-nest-primary/20">
          <span className="text-3xl font-bold text-nest-primary">{userInitials}</span>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{userName}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className={cn(
                user.status === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : user.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-red-100 text-red-700 border-red-200'
              )}
            >
              {user.status === 'VERIFIED' ? 'Verified' : user.status === 'PENDING' ? 'Pending' : 'Issue'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={user.firstName || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={user.lastName || ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <Input id="email" defaultValue={user.email} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  <Input id="phone" defaultValue={user.phone || ''} placeholder="+234 801 234 5678" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <Input id="address" placeholder="Enter your address" />
                </div>
              </div>
              <div className="pt-4">
                <Button className="bg-nest-primary hover:bg-nest-primary/90">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button variant="outline" className="w-full">
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive investment updates</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive SMS alerts</p>
                </div>
                <Switch id="sms-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing">Marketing Emails</Label>
                  <p className="text-xs text-muted-foreground">Receive promotional content</p>
                </div>
                <Switch id="marketing" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Investment Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Investment Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="riskTolerance">Risk Tolerance</Label>
              <select
                id="riskTolerance"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentGoal">Investment Goal</Label>
              <select
                id="investmentGoal"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="income">Rental Income</option>
                <option value="growth">Capital Appreciation</option>
                <option value="balanced">Balanced</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredTypes">Preferred Property Types</Label>
              <div className="flex flex-wrap gap-2">
                {['Residential', 'Commercial', 'Mixed-Use', 'Student Housing', 'Off-Plan'].map((type) => (
                  <Badge key={type} variant="outline" className="cursor-pointer hover:bg-nest-primary/10">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="pt-4">
              <Button variant="outline" className="bg-nest-primary text-white hover:bg-nest-primary/90">
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <CreditCard className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">No payment methods added</p>
                  <p className="text-xs text-muted-foreground">Add a payment method to fund your wallet</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
