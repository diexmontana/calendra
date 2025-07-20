// components/AccountStatus.tsx
'use client'

import { useEffect, useState } from "react"

interface Props {
  events: { id: string; isActive: boolean }[]
  userId: string
}

export default function AccountStatus({ events, userId }: Props) {
  const [hasSchedule, setHasSchedule] = useState<boolean | null>(null)

  useEffect(() => {
    const checkSchedule = async () => {
      try {
        const res = await fetch(`/api/has-schedule?userId=${userId}`)
        const data = await res.json()
        setHasSchedule(data.hasSchedule)
      } catch (err) {
        console.error("Error checking schedule:", err)
        setHasSchedule(false)
      }
    }

    checkSchedule()
  }, [userId])

  const total = events.length
  const active = events.filter(e => e.isActive).length
  const inactive = total - active

  return (
    <div className="w-full max-w-4xl border border-gray-300 bg-white p-6 rounded-2xl shadow-md mb-10">
      <h2 className="text-xl font-bold mb-4">📊 Panel de Estado de Cuenta</h2>
      <ul className="space-y-2 text-sm">
        <li>
          {active > 0 ? "✅" : "❌"} Tienes {active} evento(s) activo(s)
        </li>
        <li>
          {inactive > 0 ? "⚠️" : "✅"} {inactive} evento(s) inactivo(s)
        </li>
        <li>
          {hasSchedule === null
            ? "⏳ Verificando horario..."
            : hasSchedule
            ? "✅ Tu horario está configurado"
            : "❌ Aún no configuras tu horario"}
        </li>
      </ul>
    </div>
  )
}
