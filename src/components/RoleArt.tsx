import civilian from '../assets/roles/civilian.png'
import undercover from '../assets/roles/undercover.png'
import white from '../assets/roles/white.png'
import type { Role } from '../types'

const SRC: Record<Role, string> = {
  civilian,
  undercover,
  white,
}

type RoleArtProps = {
  role: Role
  className?: string
  alt?: string
}

export function RoleArt({ role, className, alt = '' }: RoleArtProps) {
  return <img src={SRC[role]} alt={alt} className={className ?? 'role-art'} />
}
