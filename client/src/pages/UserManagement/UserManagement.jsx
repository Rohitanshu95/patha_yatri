import React, { useCallback, useEffect, useMemo, useState } from "react";
import useAuthStore from "../../store/authStore";
import { useUserStore } from "../../store/userStore";
import { useHotelStore } from "../../store/hotelStore";
import { showError } from "../../utils/toast";

const PAGE_LIMIT = 10;

const getEmptyFormState = (role = "receptionist", hotel = "") => ({
  name: "",
  email: "",
  role,
  hotel,
  password: "",
  isActive: true,
});

const sortOptions = [
  { label: "Newest", value: "createdAt:desc" },
  { label: "Oldest", value: "createdAt:asc" },
  { label: "Name A-Z", value: "name:asc" },
  { label: "Name Z-A", value: "name:desc" },
  { label: "Role", value: "role:asc" },
];

const roleOptions = [
  { label: "All Roles", value: "all" },
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Receptionist", value: "receptionist" },
];

const createRoleOptions = [
  { label: "Manager", value: "manager" },
  { label: "Receptionist", value: "receptionist" },
];

const formatLastLogin = (value) => {
  if (!value) return "Never";

  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Never";
  }
};

const UserManagement = () => {
  const authUser = useAuthStore((state) => state.user);
  const { hotels: hotelOptions, fetchHotels } = useHotelStore();

  const {
    users,
    pagination,
    isLoading,
    isActionLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
    resetUserPassword,
    clearUserError,
  } = useUserStore();

  const isAdmin = authUser?.role === "admin";
  const isManager = authUser?.role === "manager";
  const defaultCreateRole = isManager ? "receptionist" : "manager";

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hotelFilter, setHotelFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState(isManager ? "receptionist" : "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt:desc");

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [formState, setFormState] = useState(getEmptyFormState(defaultCreateRole));

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });

  const effectiveRoleFilter = isManager ? "receptionist" : roleFilter;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!isAdmin) return;

    fetchHotels({ page: 1, limit: 200 });
  }, [isAdmin, fetchHotels]);

  const refreshUsers = useCallback(async () => {
    await fetchUsers({
      page: currentPage,
      limit: PAGE_LIMIT,
      search: debouncedSearch,
      hotel: isAdmin ? hotelFilter : undefined,
      role: effectiveRoleFilter,
      status: statusFilter,
      sort: sortBy,
    });
  }, [
    fetchUsers,
    currentPage,
    debouncedSearch,
    isAdmin,
    hotelFilter,
    effectiveRoleFilter,
    statusFilter,
    sortBy,
  ]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const pageNumbers = useMemo(() => {
    const totalPages = pagination?.pages || 1;
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    const pages = [];
    for (let page = adjustedStart; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [currentPage, pagination?.pages]);

  const canManageTarget = (target) => {
    if (!authUser || !target) return false;

    if (isAdmin) return true;
    if (isManager) return target.role === "receptionist";

    return false;
  };

  const canToggleStatus = (target) => {
    if (!canManageTarget(target)) return false;
    if (!authUser?._id || !target?._id) return false;
    return authUser._id !== target._id;
  };

  const openCreateModal = () => {
    clearUserError();
    setModalMode("create");
    setSelectedUser(null);

    const defaultHotel = isAdmin && hotelFilter !== "all" ? hotelFilter : "";
    setFormState(getEmptyFormState(defaultCreateRole, defaultHotel));

    setIsUserModalOpen(true);
  };

  const openEditModal = (user) => {
    if (!canManageTarget(user)) return;

    const hotelId = user?.hotel
      ? typeof user.hotel === "object"
        ? user.hotel._id || ""
        : String(user.hotel)
      : "";

    clearUserError();
    setModalMode("edit");
    setSelectedUser(user);
    setFormState({
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "receptionist",
      hotel: hotelId,
      password: "",
      isActive: user?.isActive !== false,
    });
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
    const defaultHotel = isAdmin && hotelFilter !== "all" ? hotelFilter : "";
    setFormState(getEmptyFormState(defaultCreateRole, defaultHotel));
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();

    const roleValue = isManager ? "receptionist" : formState.role;
    const requiresHotelOnEdit =
      modalMode === "edit" && (roleValue === "manager" || roleValue === "receptionist");
    const managerHotelId = isManager
      ? authUser?.hotel
        ? typeof authUser.hotel === "object"
          ? authUser.hotel._id || ""
          : String(authUser.hotel)
        : ""
      : "";
    const hotelValue = isAdmin ? (formState.hotel || "") : undefined;

    if (isAdmin && requiresHotelOnEdit && !hotelValue) {
      showError(null, "Please select a hotel for this user");
      return;
    }

    if (isManager && modalMode === "create" && !managerHotelId) {
      showError(null, "Your account is not assigned to any hotel");
      return;
    }

    let result = null;
    if (modalMode === "create") {
      const payload = {
        name: formState.name.trim(),
        email: formState.email.trim(),
        password: formState.password,
        role: roleValue,
      };

      if (isAdmin && hotelValue) {
        payload.hotel = hotelValue;
      }

      if (isManager && managerHotelId) {
        payload.hotel = managerHotelId;
      }

      result = await createUser({
        ...payload,
      });
    } else if (selectedUser?._id) {
      const payload = {
        name: formState.name.trim(),
        email: formState.email.trim(),
        role: roleValue,
        isActive: formState.isActive,
      };

      if (isAdmin && hotelValue) {
        payload.hotel = hotelValue;
      }

      result = await updateUser(selectedUser._id, {
        ...payload,
      });
    }

    if (!result) return;

    closeUserModal();

    if (modalMode === "create" && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    await refreshUsers();
  };

  const openStatusModal = (target) => {
    if (!canToggleStatus(target)) return;
    clearUserError();
    setStatusTarget(target);
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setStatusTarget(null);
    setIsStatusModalOpen(false);
  };

  const handleStatusConfirm = async () => {
    if (!statusTarget?._id) return;

    const success = statusTarget.isActive
      ? await deactivateUser(statusTarget._id)
      : await activateUser(statusTarget._id);

    if (!success) return;

    closeStatusModal();
    await refreshUsers();
  };

  const openPasswordModal = (target) => {
    if (!isAdmin || !target?._id) return;

    clearUserError();
    setPasswordTarget(target);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setPasswordTarget(null);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setIsPasswordModalOpen(false);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }

    if (!passwordTarget?._id) return;

    const success = await resetUserPassword(passwordTarget._id, passwordForm.newPassword);
    if (!success) return;

    closePasswordModal();
  };

  const totalUsers = pagination?.total || 0;

  return (
    <div className="min-h-full font-body text-on-surface">
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-headline font-bold tracking-tight text-on-surface">User Management</h2>
          <p className="mt-3 text-sm text-on-surface-variant font-medium">
            {isAdmin
              ? `Managing ${totalUsers} users across all roles`
              : `Managing ${totalUsers} receptionist accounts`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface border border-outline/20 min-w-65">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none focus:ring-0 outline-none text-sm text-on-surface w-full placeholder:text-on-surface-variant"
              placeholder="Search name or email"
            />
          </div>

          {isAdmin && (
            <select
              value={hotelFilter}
              onChange={(event) => {
                setHotelFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-surface border border-outline/20 text-sm text-on-surface outline-none"
            >
              <option value="all">All Hotels</option>
              {hotelOptions.map((hotel) => (
                <option key={hotel._id} value={hotel._id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          )}

          {isAdmin && (
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-surface border border-outline/20 text-sm text-on-surface outline-none"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 bg-surface border border-outline/20 text-sm text-on-surface outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 bg-surface border border-outline/20 text-sm text-on-surface outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>

          {(isAdmin || isManager) && (
            <button
              onClick={openCreateModal}
              className="bg-neutral-900 text-white border border-neutral-900 font-bold px-8 py-3 flex items-center gap-2 hover:bg-primary hover:border-primary transition-all uppercase text-xs tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Add User
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="mb-6 border border-error/30 bg-red-50 px-4 py-3 text-sm text-error flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            onClick={clearUserError}
            className="text-xs uppercase tracking-widest font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-16">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-outline/20 text-on-surface-variant">
          No users match the current filters.
        </div>
      ) : (
        <>
          <div className="bg-surface border border-outline/20 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-215">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/20">
                  <th className="py-4 px-4 font-bold">Name</th>
                  <th className="py-4 px-4 font-bold">Email</th>
                  <th className="py-4 px-4 font-bold">Hotel</th>
                  <th className="py-4 px-4 font-bold">Role</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-4 font-bold">Last Login</th>
                  <th className="py-4 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/15">
                {users.map((user) => {
                  const canManage = canManageTarget(user);
                  const canToggle = canToggleStatus(user);
                  const statusLabel = user.isActive ? "Active" : "Inactive";

                  return (
                    <tr key={user._id} className="hover:bg-surface-low transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 border border-outline/30 bg-surface-container flex items-center justify-center text-[10px] font-bold text-primary">
                            {(user.name || "??").substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-on-surface">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-on-surface-variant">{user.email}</td>
                      <td className="py-4 px-4 text-sm text-on-surface-variant">
                        {user.hotel?.name || "Unassigned"}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-wider border font-bold ${
                            user.role === "admin"
                              ? "bg-primary/5 text-primary border-primary/25"
                              : user.role === "manager"
                                ? "bg-on-surface/5 text-on-surface border-on-surface/20"
                                : "bg-surface-container text-on-surface-variant border-outline/30"
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">shield</span>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold border ${
                            user.isActive
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-error border-red-200"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-on-surface-variant">
                        {formatLastLogin(user.lastLogin)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {canManage && (
                            <button
                              onClick={() => openEditModal(user)}
                              className="w-9 h-9 border border-outline/25 text-on-surface-variant hover:text-primary hover:border-primary transition-colors flex items-center justify-center"
                              title="Edit user"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                          )}

                          {canToggle && (
                            <button
                              onClick={() => openStatusModal(user)}
                              className={`w-9 h-9 border transition-colors flex items-center justify-center ${
                                user.isActive
                                  ? "border-outline/25 text-on-surface-variant hover:text-error hover:border-error"
                                  : "border-outline/25 text-on-surface-variant hover:text-primary hover:border-primary"
                              }`}
                              title={user.isActive ? "Deactivate user" : "Activate user"}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {user.isActive ? "person_off" : "verified_user"}
                              </span>
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => openPasswordModal(user)}
                              className="w-9 h-9 border border-outline/25 text-on-surface-variant hover:text-primary hover:border-primary transition-colors flex items-center justify-center"
                              title="Reset password"
                            >
                              <span className="material-symbols-outlined text-lg">key</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 && (
            <footer className="mt-12 pt-8 border-t border-outline/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <p>
                Showing {(currentPage - 1) * PAGE_LIMIT + 1} to {Math.min(currentPage * PAGE_LIMIT, totalUsers)} of {totalUsers} users
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 border border-outline/25 flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-50 disabled:hover:border-outline/25 disabled:hover:text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 border text-xs transition-colors ${
                      page === currentPage
                        ? "bg-primary border-primary text-white"
                        : "border-outline/25 text-on-surface-variant hover:border-primary hover:text-primary"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.pages || 1, prev + 1))}
                  disabled={currentPage === pagination.pages}
                  className="w-8 h-8 border border-outline/25 flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-50 disabled:hover:border-outline/25 disabled:hover:text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </footer>
          )}
        </>
      )}

      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto w-full p-4 md:p-6 z-50">
          <div className="min-h-full flex items-start justify-center">
            <div className="relative bg-surface w-full max-w-2xl border border-outline/20 shadow-[0_40px_80px_rgba(0,0,0,0.35)] p-6 md:p-8 max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] overflow-y-auto my-2">
              <div className="flex items-center justify-between pb-4 border-b border-outline/20 mb-8">
                <h3 className="text-3xl font-headline font-bold tracking-tight text-on-surface">
                  {modalMode === "create" ? "Add User" : "Edit User"}
                </h3>
                <button
                  onClick={closeUserModal}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleUserSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Full Name
                  </label>
                  <input
                    required
                    value={formState.name}
                    onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                    placeholder="User name"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={formState.email}
                    onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Role
                    </label>
                    {isManager ? (
                      <input
                        value="receptionist"
                        disabled
                        className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface-variant"
                      />
                    ) : (
                      <select
                        value={formState.role}
                        onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value }))}
                        className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                      >
                        {modalMode === "create"
                          ? createRoleOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.value}
                              </option>
                            ))
                          : roleOptions
                              .filter((option) => option.value !== "all")
                              .map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.value}
                                </option>
                              ))}
                      </select>
                    )}
                  </div>

                  {modalMode === "edit" && (
                    <div>
                      <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Status
                      </label>
                      <select
                        value={formState.isActive ? "active" : "inactive"}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            isActive: event.target.value === "active",
                          }))
                        }
                        className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                      >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div>
                    <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Hotel Association
                    </label>
                    <select
                      required={
                        modalMode === "edit" &&
                        (formState.role === "manager" || formState.role === "receptionist")
                      }
                      value={formState.hotel}
                      onChange={(event) => setFormState((prev) => ({ ...prev, hotel: event.target.value }))}
                      className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                    >
                      <option value="">Select hotel</option>
                      {hotelOptions.map((hotel) => (
                        <option key={hotel._id} value={hotel._id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {modalMode === "create" && (
                  <div>
                    <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Temporary Password
                    </label>
                    <input
                      required
                      type="password"
                      value={formState.password}
                      onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
                      className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                      placeholder="Create a secure password"
                    />
                    <p className="mt-2 text-xs text-on-surface-variant">
                      Password must be at least 8 chars with upper/lowercase letters, number, and symbol.
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-outline/20 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeUserModal}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-outline/25 text-on-surface-variant hover:border-outline/60 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isActionLoading}
                    className="px-8 py-3 text-xs font-bold uppercase tracking-widest bg-primary text-white border border-primary hover:bg-primary-container hover:border-primary-container transition-colors disabled:opacity-60"
                  >
                    {modalMode === "create" ? "Create User" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isStatusModalOpen && statusTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-surface border border-outline/25 p-8 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-error text-3xl mt-1">warning</span>
              <div>
                <h4 className="text-2xl font-headline font-semibold text-on-surface">
                  {statusTarget.isActive ? "Deactivate User" : "Activate User"}
                </h4>
                <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                  {statusTarget.isActive
                    ? `Deactivate ${statusTarget.name}? They will no longer be able to sign in.`
                    : `Activate ${statusTarget.name}? They will regain access to the system.`}
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={closeStatusModal}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-outline/25 text-on-surface-variant hover:border-outline/60"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusConfirm}
                disabled={isActionLoading}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border transition-colors disabled:opacity-60 ${
                  statusTarget.isActive
                    ? "border-error text-error hover:bg-error hover:text-white"
                    : "border-primary text-primary hover:bg-primary hover:text-white"
                }`}
              >
                {statusTarget.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPasswordModalOpen && passwordTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-surface border border-outline/25 p-8 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between pb-4 border-b border-outline/20 mb-6">
              <h4 className="text-2xl font-headline font-semibold text-on-surface">Reset Password</h4>
              <button
                onClick={closePasswordModal}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <p className="text-sm text-on-surface-variant">
                Set a new password for <span className="text-on-surface font-semibold">{passwordTarget.name}</span>.
              </p>

              <div>
                <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  New Password
                </label>
                <input
                  required
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                  }
                  className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                  placeholder="Enter secure password"
                />
              </div>

              <div>
                <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Confirm Password
                </label>
                <input
                  required
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                  className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                  placeholder="Confirm password"
                />
              </div>

              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-xs text-error">Passwords do not match.</p>
              )}

              <div className="pt-4 border-t border-outline/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-outline/25 text-on-surface-variant hover:border-outline/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isActionLoading ||
                    !passwordForm.newPassword ||
                    passwordForm.newPassword !== passwordForm.confirmPassword
                  }
                  className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-60"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;