// import { getCachedGlobal } from '@/utilities/getGlobals'
// import Link from 'next/link'
// import React from 'react'

// import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
// import { CMSLink } from '@/components/Link'
// import { Logo } from '@/components/Logo/Logo'

// export async function Footer() {
//   const footerData = await getCachedGlobal('footer', 1)()

//   const navItems = footerData?.navItems || []

//   return (
//     <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
//       <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
//         <Link className="flex items-center" href="/">
//           <Logo />
//         </Link>

//         <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
//           <ThemeSelector />
//           <nav className="flex flex-col md:flex-row gap-4">
//             {navItems.map(({ link }, i) => {
//               return <CMSLink className="text-white" key={i} {...link} />
//             })}
//           </nav>
//         </div>
//       </div>
//     </footer>
//   )
// }

import Link from 'next/link'

const footerGroups = [
  {
    title: 'Property',
    links: [
      { label: 'Properties', href: '/properties' },
      { label: 'Map', href: '/properties/map' },
      { label: 'Sell My Property', href: '/sell' },
    ],
  },
  {
    title: 'Company',
    links: [{ label: 'Agencies', href: '/agencies' }],
  },
  {
    title: 'Account',
    links: [
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/register' },
      { label: 'My Account', href: '/account' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t border-black bg-white text-black">
      <div className="mx-auto w-full max-w-[1680px] px-4 md:px-8">
        <div className="grid gap-12 py-14 md:grid-cols-12 md:gap-8 lg:py-20">
          {/* Brand */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link className="inline-block" href="/">
              <div className="text-[28px] font-bold leading-none tracking-[-0.04em]">HAME</div>

              <div className="mt-1.5 text-[7px] font-medium uppercase tracking-[0.32em]">
                Homes · Commercial · Land
              </div>
            </Link>
          </div>
          {/* Navigation */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:col-span-8 md:grid-cols-4 lg:col-span-7">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <div className="mb-5 text-[9px] font-medium uppercase tracking-[0.24em] text-black/45">
                  {group.title}
                </div>

                <nav className="flex flex-col items-start gap-3">
                  {group.links.map((link) => (
                    <Link
                      className="text-sm transition-opacity hover:opacity-50"
                      href={link.href}
                      key={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-black/30 py-5 text-[9px] font-medium uppercase tracking-[0.2em] text-black/60 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} HAME</div>
          <div>Property across Scotland</div>
          <a className="transition-colors hover:text-black" href="#top">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
