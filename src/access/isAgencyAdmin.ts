export const isAgencyAdmin = ({ req }: any) => {
  return req.user?.role === 'agency-admin'
}
