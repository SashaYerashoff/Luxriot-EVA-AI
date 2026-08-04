import {
  IconChevronsDown,
  IconChevronsUp,
  IconDroplet,
  IconEye,
  IconFileDescription,
  IconPlayerPlay,
  IconPlayerStop,
  IconReload,
  IconSettings,
  IconVideo,
} from '@tabler/icons-react'
import type { Channel } from '../../api/types'
import type { ReactNode } from 'react'
import { Dropdown, type DropOption } from '../shell/Dropdown'
import { ToolbarActionMenu } from '../shell/ToolbarActionMenu'
import { ToolTabs } from '../shell/ToolTabs'
import type { SummaryPeriod, SummaryResolution } from './summaryView'

const BATCHES = ['4', '8', '12', '16', '24', '32']
export const PERIODS: Array<{ v: SummaryPeriod; label: string }> = [
  { v: 'live', label: 'Live' },
  { v: 'today', label: 'Today' },
  { v: 'yesterday', label: 'Yesterday' },
  { v: 'day_before_yesterday', label: 'Day before yesterday' },
  { v: '7d', label: 'Last 7 days' },
  { v: '30d', label: 'Last 30 days' },
  { v: 'custom', label: 'Custom range…' },
]
export const RESOLUTIONS: Array<{ v: SummaryResolution; label: string }> = [
  { v: 'AUTO', label: 'Auto' },
  { v: 'L0', label: 'Observations' },
  { v: 'L1', label: '15 minute summaries' },
  { v: 'L2', label: '1 hour summaries' },
  { v: 'L3', label: '8 hour summaries' },
]

export type VideoWorkspaceTab = 'review' | 'settings'

export function StreamControl(p: {
  navigation?: ReactNode
  channels: Channel[]
  activeTab: VideoWorkspaceTab
  onTab: (tab: VideoWorkspaceTab) => void
  settingsChannelId: number | null
  onSettingsChannel: (id: number) => void
  reviewChannelId: number | null
  onReviewChannel: (id: number) => void
  onReload: () => void
  batch: string; onBatch: (v: string) => void
  every: string; onEvery: (v: string) => void
  model: string; onModel: (v: string) => void; modelOptions: DropOption[]
  canCapture: boolean
  canManagePrompts: boolean
  capturing: boolean; busy: boolean
  onStart: () => void; onStop: () => void; onFlush: () => void
  onPromptSettings: () => void
  period: SummaryPeriod; onPeriod: (v: SummaryPeriod) => void
  resolution: SummaryResolution; onResolution: (v: SummaryResolution) => void
  customFrom: string; onCustomFrom: (v: string) => void
  customTo: string; onCustomTo: (v: string) => void
  onApplyCustom: () => void
  onRefreshFeed: () => void
  live: boolean; onToggleLive: () => void
  summaryCount: number
  allSummariesCollapsed: boolean
  onToggleAllSummaries: () => void
  onOpenPreview: () => void
  settingsDirty: boolean
  onDiscardSettings: () => void
}) {
  const settingsTitle = p.channels.find((c) => c.id === p.settingsChannelId)?.title || '—'
  const reviewTitle = p.channels.find((c) => c.id === p.reviewChannelId)?.title || '—'
  const settingsSummary = `${settingsTitle} · batch ${p.batch} · ${p.every}s · ${p.capturing ? 'capturing' : 'idle'}`
  const reviewSummary = [
    reviewTitle,
    PERIODS.find((item) => item.v === p.period)?.label || 'Live',
    RESOLUTIONS.find((item) => item.v === p.resolution)?.label || 'Auto',
    p.live ? 'live on' : 'live off',
  ].join(' · ')

  return (
    <ToolTabs
      tabs={[
        { id: 'review', icon: <IconFileDescription size={13} />, label: 'Stream review', summary: reviewSummary },
        { id: 'settings', icon: <IconVideo size={13} />, label: 'Stream settings', summary: settingsSummary },
      ]}
      active={p.activeTab}
      onSelect={(id) => p.onTab(id as VideoWorkspaceTab)}
      leading={p.navigation}
    >
      {p.activeTab === 'settings' ? (
        <div className="vid-settings-toolbar">
          <section className="vid-control-group source">
            <div className="wfield ch"><label>Channel</label>
              <div className="vid-row">
                <Dropdown value={String(p.settingsChannelId ?? '')} onChange={(v) => p.onSettingsChannel(Number(v))}
                  options={p.channels.map((c) => ({ value: String(c.id), label: c.title }))} />
              </div>
            </div>
          </section>
          <section className="vid-control-group sampling">
            <div className="vid-control-fields">
              <div className="wfield batch"><label>Batch</label>
                <Dropdown value={p.batch} onChange={p.onBatch} options={BATCHES.map((b) => ({ value: b, label: b }))} />
              </div>
              <div className="wfield xs"><label>Every (s)</label>
                <input type="number" min={0.2} max={300} step={0.1} value={p.every} onChange={(e) => p.onEvery(e.target.value)} />
              </div>
            </div>
          </section>
          <section className="vid-control-group inference">
            <div className="wfield model"><label>Live model</label>
              <Dropdown value={p.model} onChange={p.onModel} options={p.modelOptions} />
            </div>
          </section>
          <section className="vid-control-group actions">
            <div className="vid-tb-actions">
              <ToolbarActionMenu actions={[
                {
                  id: 'reload-channels', label: 'Reload channels', icon: <IconReload size={15} />,
                  onSelect: p.onReload,
                },
                ...(p.canCapture && p.capturing ? [{
                  id: 'stop', label: 'Stop summaries', icon: <IconPlayerStop size={15} />,
                  onSelect: p.onStop, disabled: p.busy, danger: true,
                }] : []),
                ...(p.canCapture ? [{
                  id: 'flush', label: 'Flush pending summaries', icon: <IconDroplet size={15} />,
                  onSelect: p.onFlush, disabled: p.busy || !p.capturing,
                }] : []),
                ...(p.canManagePrompts ? [{
                  id: 'prompts', label: 'Prompts and alerts', icon: <IconSettings size={15} />,
                  onSelect: p.onPromptSettings,
                }] : []),
                ...(p.settingsDirty ? [{
                  id: 'discard', label: 'Discard draft', icon: <IconReload size={15} />,
                  onSelect: p.onDiscardSettings, disabled: p.busy,
                }] : []),
              ]} />
              {p.canCapture && (p.capturing
                ? <button className="mon-btn accent vid-toggle" disabled={p.busy || !p.settingsDirty} onClick={p.onStart} title="Restart this stream with the edited sampling and inference settings"><IconPlayerPlay size={15} /> Apply changes</button>
                : <button className="mon-btn accent vid-toggle" disabled={p.busy} onClick={p.onStart}><IconPlayerPlay size={15} /> Start summaries</button>)}
            </div>
          </section>
        </div>
      ) : (
        <div className="vid-lens-stack">
          <div className="vid-tb-row vid-lens-row">
            <div className="wfield ch"><label>Channel</label>
              <div className="vid-row">
                <Dropdown value={String(p.reviewChannelId ?? '')} onChange={(v) => p.onReviewChannel(Number(v))}
                  options={p.channels.map((c) => ({ value: String(c.id), label: c.title }))} />
              </div>
            </div>
            <div className="wfield hist"><label>Period</label>
              <Dropdown
                value={p.period}
                onChange={(value) => p.onPeriod(value as SummaryPeriod)}
                options={PERIODS.map((item) => ({ value: item.v, label: item.label }))}
              />
            </div>
            <div className="wfield resolution"><label>Resolution</label>
              <Dropdown
                value={p.resolution}
                onChange={(value) => p.onResolution(value as SummaryResolution)}
                options={RESOLUTIONS.map((item) => ({ value: item.v, label: item.label }))}
              />
            </div>
            <div className="vid-tb-actions">
              <ToolbarActionMenu actions={[
                { id: 'reload-channels', label: 'Reload channels', icon: <IconReload size={15} />, onSelect: p.onReload },
                { id: 'refresh', label: 'Refresh summaries', icon: <IconReload size={15} />, onSelect: p.onRefreshFeed },
                {
                  id: 'collapse',
                  label: p.allSummariesCollapsed ? 'Expand all summaries' : 'Collapse all summaries',
                  icon: p.allSummariesCollapsed ? <IconChevronsDown size={15} /> : <IconChevronsUp size={15} />,
                  onSelect: p.onToggleAllSummaries,
                  disabled: !p.summaryCount,
                },
                {
                  id: 'preview', label: 'Open preview', icon: <IconEye size={15} />,
                  onSelect: p.onOpenPreview, disabled: p.reviewChannelId == null,
                },
                ...(p.period === 'custom' ? [{
                  id: 'apply-range', label: 'Apply custom range', icon: <IconReload size={15} />,
                  onSelect: p.onApplyCustom, disabled: !p.customFrom || !p.customTo,
                }] : []),
              ]} />
              <button className={`mon-btn accent vid-toggle`} onClick={p.onToggleLive}><IconPlayerPlay size={14} /> {p.live ? 'Live on' : 'Live off'}</button>
            </div>
          </div>
          {p.period === 'custom' && (
            <div className="vid-lens-custom">
              <div className="wfield"><label>From</label>
                <input type="datetime-local" value={p.customFrom} onChange={(event) => p.onCustomFrom(event.target.value)} />
              </div>
              <div className="wfield"><label>To</label>
                <input type="datetime-local" value={p.customTo} onChange={(event) => p.onCustomTo(event.target.value)} />
              </div>
            </div>
          )}
        </div>
      )}
    </ToolTabs>
  )
}
