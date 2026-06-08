export const isAgencyMember = ({ req }: any) => {
  return ['agency-admin', 'agent'].includes(req.user?.role)
}
