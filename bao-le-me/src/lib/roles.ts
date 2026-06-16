import type { RoleDef, RoleKey } from '@/lib/types';

export const ROLES: Record<RoleKey, RoleDef> = {
  boss: {
    key: 'boss',
    label: '老板',
    emoji: 'BOSS',
    desc: '有自己的生意，需要整体运营方向',
    defaultIndustry: '综合',
    defaultAudience: ['25-45岁消费群体'],
  },
  operator: {
    key: 'operator',
    label: '运营',
    emoji: 'OPS',
    desc: '负责日常内容运营，需要选题和脚本',
    defaultIndustry: '电商/品牌',
    defaultAudience: ['18-35岁活跃用户'],
  },
  sales: {
    key: 'sales',
    label: '销售',
    emoji: 'SALE',
    desc: '需要用内容获客和转化',
    defaultIndustry: '服务/零售',
    defaultAudience: ['有明确需求的客户'],
  },
  'shop-owner': {
    key: 'shop-owner',
    label: '店主',
    emoji: 'SHOP',
    desc: '线下门店，需要同城引流',
    defaultIndustry: '餐饮/零售',
    defaultAudience: ['3km内周边人群'],
  },
  'personal-ip': {
    key: 'personal-ip',
    label: '个人IP',
    emoji: 'IP',
    desc: '打造个人品牌，需要差异化人设',
    defaultIndustry: '知识/咨询',
    defaultAudience: ['行业关注者'],
  },
};

export function getRole(key: RoleKey): RoleDef {
  return ROLES[key];
}

export function getAllRoles(): RoleDef[] {
  return Object.values(ROLES);
}
