export const isSuperAdmin = ({ req }: any) => {
  return req.user?.role === 'super-admin'
}
