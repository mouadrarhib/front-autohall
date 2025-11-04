export type CountStat = {
  total: number;
  active: number;
};

export interface DashboardStats {
  users: CountStat;
  groupements: CountStat;
  filiales: CountStat;
  succursales: CountStat;
  marques: CountStat;
  sites: CountStat;
  userSites: CountStat;
}
