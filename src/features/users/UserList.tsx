// src/features/users/UserList.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Paper, Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { GridPaginationModel } from "@mui/x-data-grid";
import { authApi } from "../../api/endpoints/auth.api";
import { useRoles } from "../../hooks/useRoles";
import { UserHeader } from "./UserHeader";
import { UserTable } from "./UserTable";
import { useUserColumns } from "./useUserColumns";
import { UserDetailsDialog } from "./UserDetailsDialog";
import type { PaginationState, User } from "./userTypes";

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,
};

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { isAdminFonctionnel } = useRoles();
  const canCreateUser = isAdminFonctionnel;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGINATION);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  const activeUsersCount = useMemo(
    () => users.filter((user) => user.UserActive).length,
    [users]
  );
  const totalUsersCount = useMemo(
    () => pagination.totalRecords || users.length,
    [pagination.totalRecords, users.length]
  );

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.getAllUsers({ active_only: false });

      let usersData: User[] = [];
      let total = 0;

      if (response && typeof response === "object") {
        if ("data" in response && Array.isArray(response.data)) {
          usersData = response.data as User[];
          total = (response as any).total ?? response.data.length;
        } else if (Array.isArray(response)) {
          usersData = response as User[];
          total = response.length;
        }
      }

      setUsers(usersData);
      setPagination((prev) => ({
        ...prev,
        totalRecords: total,
        totalPages: Math.ceil(total / prev.pageSize),
      }));
    } catch (err: any) {
      console.error("Failed to load users:", err);
      setError(err?.response?.data?.error ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, pagination.page, pagination.pageSize]);

  const handleViewClick = useCallback(
    async (userId: number, event: React.MouseEvent) => {
      event.stopPropagation();

      try {
        setLoadingUserDetails(true);
        setOpenDialog(true);

        // Fetch complete user information
        const userData = await authApi.getUserCompleteInfo(userId);
        setSelectedUser(userData);
      } catch (err: any) {
        console.error("Failed to load user details:", err);
        setError(err?.response?.data?.error ?? "Failed to load user details");
        setOpenDialog(false);
      } finally {
        setLoadingUserDetails(false);
      }
    },
    []
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setSelectedUser(null);
  }, []);

  const handleEditClick = useCallback(
    (userId: number, event: React.MouseEvent) => {
      event.stopPropagation();
      console.log("Navigating to edit user:", userId); // Add this line
      console.log("Path:", `/users/${userId}/edit`); // Add this line
      navigate(`/users/${userId}/edit`);
    },
    [navigate]
  );

  const handlePermissionsClick = useCallback(
    (userId: number, event: React.MouseEvent) => {
      event.stopPropagation();
      navigate(`/users/${userId}/roles-permissions`);
    },
    [navigate]
  );

  const columns = useUserColumns({
    isSmallScreen,
    isMediumScreen,
    onView: handleViewClick,
    onEdit: handleEditClick,
    //onPermissions: handlePermissionsClick,
  });

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPagination((prev) => ({
      ...prev,
      page: model.pageSize !== prev.pageSize ? 1 : model.page,
      pageSize: model.pageSize,
    }));
  };

  return (
    <Stack spacing={3}>
      <UserHeader
        totalUsers={totalUsersCount}
        activeUsers={activeUsersCount}
        canCreateUser={canCreateUser}
        onCreate={() => navigate("/users/new")}
      />

      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            borderRadius: 2,
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <UserTable
          rows={users} // Changed from 'users' to 'rows'
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      </Paper>

      {/* User Details Dialog */}
      <UserDetailsDialog
        open={openDialog}
        user={selectedUser}
        loading={loadingUserDetails}
        onClose={handleCloseDialog}
      />
    </Stack>
  );
};
