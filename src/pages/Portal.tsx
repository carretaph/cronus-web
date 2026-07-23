import { Link } from 'react-router-dom'

import { getAuthenticatedUser } from '../auth/auth'
import { getCustomers } from './customerdata'

export default function Portal() {
  const customers = getCustomers()
  const user = getAuthenticatedUser()

  const firstName =
    user?.name === 'Cronus Administrator'
      ? 'Alberto'
      : user?.name?.split(' ')[0] || 'Authorized User'

  const greeting = getGreeting()

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  return (
    <section className="px-5 py-9 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Dashboard
            </p>

            <h2 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              {greeting}, {firstName}.
            </h2>

            <p className="mt-4 text-base text-[#888888]">
              {currentDate}
            </p>
          </div>

          <Link
            to="/portal/customers"
            className="inline-flex h-14 items-center justify-center rounded-xl bg-[#222222] px-7 text-sm font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#B59A68]"
          >
            New quote
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Customers"
            value={String(customers.length)}
            description="Total customer records"
          />

          <DashboardCard
            title="Pending Quotes"
            value="0"
            description="Quotes requiring follow-up"
          />

          <DashboardCard
            title="Appointments"
            value="0"
            description="Scheduled for today"
          />

          <DashboardCard
            title="Sales This Month"
            value="$0"
            description="Approved sales volume"
          />
        </div>

        <div className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-[24px] border border-[#E8E5DE] bg-white p-7 sm:p-9">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h3 className="text-xl font-medium text-[#444444]">
                  Today&apos;s activity
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#888888]">
                  Appointments, follow-ups and recent
                  quotes will appear here.
                </p>
              </div>

              <span className="rounded-full bg-[#F3EFE6] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[#9A8258]">
                Today
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <ActivityCard
                title="Appointments"
                value="0"
                description="No appointments scheduled"
              />

              <ActivityCard
                title="Follow-ups"
                value="0"
                description="No pending follow-ups"
              />

              <ActivityCard
                title="Quotes"
                value="0"
                description="No quotes created today"
              />
            </div>

            <div className="mt-8 flex min-h-44 items-center justify-center rounded-2xl border border-dashed border-[#D9D5CC] bg-[#FAF9F6] px-6 text-center">
              <div>
                <p className="text-base font-medium text-[#666666]">
                  Your workday is clear
                </p>

                <p className="mt-2 text-sm leading-6 text-[#999999]">
                  New appointments and pending tasks will
                  appear in this area.
                </p>
              </div>
            </div>
          </section>

          <aside className="rounded-[24px] bg-[#222222] p-7 text-white sm:p-9">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#B59A68]">
              Quick start
            </p>

            <h3 className="mt-5 text-2xl font-light">
              Create your next quote
            </h3>

            <p className="mt-4 text-sm leading-7 text-white/60">
              Select an existing customer or create a new
              customer record before beginning an
              estimate.
            </p>

            <Link
              to="/portal/customers"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3.5 text-sm font-medium text-[#222222] transition hover:bg-[#B59A68] hover:text-white"
            >
              Open customers
            </Link>

            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />

                <span className="text-sm text-white/70">
                  Portal operating normally
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function getGreeting() {
  const currentHour = new Date().getHours()

  if (currentHour < 12) {
    return 'Good morning'
  }

  if (currentHour < 18) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

type DashboardCardProps = {
  title: string
  value: string
  description: string
}

function DashboardCard({
  title,
  value,
  description,
}: DashboardCardProps) {
  return (
    <article className="rounded-[22px] border border-[#E8E5DE] bg-white p-6">
      <p className="text-sm font-medium text-[#777777]">
        {title}
      </p>

      <p className="mt-4 text-4xl font-light tracking-[-0.04em] text-[#333333]">
        {value}
      </p>

      <p className="mt-3 text-sm leading-6 text-[#999999]">
        {description}
      </p>
    </article>
  )
}

type ActivityCardProps = {
  title: string
  value: string
  description: string
}

function ActivityCard({
  title,
  value,
  description,
}: ActivityCardProps) {
  return (
    <article className="rounded-2xl border border-[#ECE8DF] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-[#666666]">
          {title}
        </p>

        <p className="text-2xl font-light text-[#333333]">
          {value}
        </p>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#999999]">
        {description}
      </p>
    </article>
  )
}