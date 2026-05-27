import type { WorkspaceRole } from '@/src/types'

// ----------------------------------------------------------------
// Permission flags per role
// ----------------------------------------------------------------
export interface RolePermissions {
  /** Can invite or remove workspace members */
  canManageMembers: boolean
  /** Can update workspace settings (name, logo, slug) */
  canManageWorkspace: boolean
  /** Can create / update / delete spaces */
  canManageSpaces: boolean
  /** Can create / update / delete projects and lists */
  canManageProjects: boolean
  /** Can create tasks */
  canCreateTasks: boolean
  /** Can update any task (not just own) */
  canUpdateAnyTask: boolean
  /** Can delete any task (not just own) */
  canDeleteAnyTask: boolean
  /** Can post comments */
  canComment: boolean
  /** Can delete any comment (not just own) */
  canDeleteAnyComment: boolean
  /** Can view private spaces */
  canViewPrivateSpaces: boolean
}

export interface RoleConfig {
  label: string
  description: string
  permissions: RolePermissions
}

export const ROLE_CONFIG: Record<WorkspaceRole, RoleConfig> = {
  owner: {
    label: 'Proprietário',
    description: 'Controle total do workspace, incluindo exclusão e transferência de propriedade.',
    permissions: {
      canManageMembers: true,
      canManageWorkspace: true,
      canManageSpaces: true,
      canManageProjects: true,
      canCreateTasks: true,
      canUpdateAnyTask: true,
      canDeleteAnyTask: true,
      canComment: true,
      canDeleteAnyComment: true,
      canViewPrivateSpaces: true,
    },
  },
  admin: {
    label: 'Administrador',
    description: 'Pode gerenciar membros, espaços e projetos, mas não pode excluir o workspace.',
    permissions: {
      canManageMembers: true,
      canManageWorkspace: false,
      canManageSpaces: true,
      canManageProjects: true,
      canCreateTasks: true,
      canUpdateAnyTask: true,
      canDeleteAnyTask: true,
      canComment: true,
      canDeleteAnyComment: true,
      canViewPrivateSpaces: false,
    },
  },
  member: {
    label: 'Membro',
    description: 'Pode criar e editar tarefas nos projetos em que tem acesso.',
    permissions: {
      canManageMembers: false,
      canManageWorkspace: false,
      canManageSpaces: false,
      canManageProjects: false,
      canCreateTasks: true,
      canUpdateAnyTask: true,
      canDeleteAnyTask: false,
      canComment: true,
      canDeleteAnyComment: false,
      canViewPrivateSpaces: false,
    },
  },
  viewer: {
    label: 'Visualizador',
    description: 'Acesso somente leitura a espaços e projetos públicos.',
    permissions: {
      canManageMembers: false,
      canManageWorkspace: false,
      canManageSpaces: false,
      canManageProjects: false,
      canCreateTasks: false,
      canUpdateAnyTask: false,
      canDeleteAnyTask: false,
      canComment: false,
      canDeleteAnyComment: false,
      canViewPrivateSpaces: false,
    },
  },
}

/**
 * Returns true if the given role has the requested permission.
 */
export function hasPermission(
  role: WorkspaceRole,
  permission: keyof RolePermissions
): boolean {
  return ROLE_CONFIG[role].permissions[permission]
}
