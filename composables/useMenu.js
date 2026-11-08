// ~/composables/useMenu.js
import { ref, isRef, computed } from 'vue'

// ถ้า backend ส่ง 'evaluatee' ให้ map มาเป็น 'user'
function normalizeRole(role) {
  const x = (role || '').toString()
  return ['Admin', 'Evaluator', 'User'].includes(x) ? x : 'User'
}

const MAP = {
  Admin: [
    {
      label: 'เมณูหลัก',
      items: [
        { label: 'จัดการผู้ประเมิน', to: '/admin/evaluator/evaluator_list',              icon: 'mdi-view-dashboard-outline' },
        { label: 'จัดการผู้รับประเมิน', to: '/admin/user/user_list',              icon: 'mdi-view-dashboard-outline' },
        { label: 'จัดการหัวข้อการประเมิน',    to: '/admin/topic/topic_list',        icon: 'mdi-tray-arrow-up' },
        { label: 'สร้างการประเมิน',    to: '/admin/evaluation/create',        icon: 'mdi-tray-arrow-up' },
      ]
    },
  ],

  Evaluator: [
    {
      label: 'เมณูหลัก',
      items: [
        { label: 'รายการประเมิน', to: '/evaluator/list',           icon: 'mdi-view-dashboard-outline' },
        { label: 'แก้ไขข้อมูลส่วนตัว',    to: '/evaluator/edit',     icon: 'mdi-tray-arrow-up' }, // ✅ บังคับมีแน่
      ]
    },
  ],

  User: [
    {
      label: 'เมณูหลัก',
      items: [
        { label: 'รายการประเมิน', to: '/user/list',           icon: 'mdi-view-dashboard-outline' },
        { label: 'แก้ไขข้อมูลส่วนตัว',    to: '/user/edit',     icon: 'mdi-tray-arrow-up' }, // ✅ บังคับมีแน่
      ]
    },
  ]
}

export function useMenu(roleInput = 'User') {
  const r = isRef(roleInput) ? roleInput : ref(roleInput)

  // ให้เมนูปลอดภัยแม้ role ยังไม่พร้อม (ตอน hydrate แรก ๆ)
  const menu = computed(() => {
    const key = normalizeRole(r.value)
    return MAP[key]
  })

  return { menu }
}
