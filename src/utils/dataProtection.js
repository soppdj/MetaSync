// src/utils/dataProtection.js
// MetaSync Data Protection Sentinel (Anti-Reset & Anti-Overwrite Engine)
// Protects user workspace data from accidental overwrites, browser resets, and empty syncs.

const SNAPSHOT_KEY = 'metasync_snapshots_history';
const MAX_SNAPSHOTS = 15;

/**
 * Creates an immutable snapshot of all user work data
 */
export function createDataSnapshot(reason = 'Auto-Save Sentinel') {
  try {
    const snapshot = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      reason,
      data: {
        campaigns: JSON.parse(localStorage.getItem('metasync_campaigns_cache') || '[]'),
        reportRecords: JSON.parse(localStorage.getItem('metasync_report_records') || '[]'),
        hypnowritingLogs: JSON.parse(localStorage.getItem('metasync_hypnowriting_cache') || '[]'),
        settings: {
          supabaseUrl: localStorage.getItem('metasync_supabase_url') || '',
          metaAccount: localStorage.getItem('metasync_meta_account') || '',
          telegramChat: localStorage.getItem('metasync_telegram_chat') || '',
        }
      }
    };

    // Only create snapshot if there is meaningful data
    if (snapshot.data.campaigns.length === 0 && snapshot.data.reportRecords.length === 0) {
      return null;
    }

    const history = getSnapshotHistory();
    history.unshift(snapshot);

    // Keep only last MAX_SNAPSHOTS
    if (history.length > MAX_SNAPSHOTS) {
      history.length = MAX_SNAPSHOTS;
    }

    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(history));
    return snapshot;
  } catch (err) {
    console.error('[DataProtection] Failed to create snapshot:', err);
    return null;
  }
}

/**
 * Retrieves snapshot history
 */
export function getSnapshotHistory() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Restores state from a specific snapshot
 */
export function restoreFromSnapshot(snapshotId) {
  try {
    const history = getSnapshotHistory();
    const target = history.find(s => s.id === snapshotId);
    if (!target) return { success: false, error: 'Snapshot tidak ditemukan' };

    // Create a safety snapshot of current state before rolling back
    createDataSnapshot('Pre-Rollback Safety Point');

    if (target.data.campaigns) {
      localStorage.setItem('metasync_campaigns_cache', JSON.stringify(target.data.campaigns));
    }
    if (target.data.reportRecords) {
      localStorage.setItem('metasync_report_records', JSON.stringify(target.data.reportRecords));
    }
    if (target.data.hypnowritingLogs) {
      localStorage.setItem('metasync_hypnowriting_cache', JSON.stringify(target.data.hypnowritingLogs));
    }

    return { success: true, timestamp: target.formattedTime };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Exports full user database & configuration to a downloadable JSON file
 */
export function exportFullBackupFile() {
  try {
    const backupData = {
      app: 'MetaSync by FatherLab',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      exportedAtFormatted: new Date().toLocaleString('id-ID'),
      workData: {
        campaigns: JSON.parse(localStorage.getItem('metasync_campaigns_cache') || '[]'),
        reportRecords: JSON.parse(localStorage.getItem('metasync_report_records') || '[]'),
        hypnowritingLogs: JSON.parse(localStorage.getItem('metasync_hypnowriting_cache') || '[]'),
        snapshots: getSnapshotHistory()
      },
      settings: {
        supabaseUrl: localStorage.getItem('metasync_supabase_url') || '',
        metaAccount: localStorage.getItem('metasync_meta_account') || '',
        telegramChat: localStorage.getItem('metasync_telegram_chat') || '',
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `MetaSync_DataProtection_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Imports full user backup from a JSON file with validation
 */
export function importFullBackupFile(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || (!parsed.workData && !parsed.campaigns)) {
      throw new Error('Format file backup tidak valid untuk MetaSync.');
    }

    // Auto snapshot current state first
    createDataSnapshot('Pre-Import Backup Safety Point');

    const workData = parsed.workData || parsed;

    if (Array.isArray(workData.campaigns)) {
      localStorage.setItem('metasync_campaigns_cache', JSON.stringify(workData.campaigns));
    }
    if (Array.isArray(workData.reportRecords)) {
      localStorage.setItem('metasync_report_records', JSON.stringify(workData.reportRecords));
    }
    if (Array.isArray(workData.hypnowritingLogs)) {
      localStorage.setItem('metasync_hypnowriting_cache', JSON.stringify(workData.hypnowritingLogs));
    }

    if (parsed.settings) {
      if (parsed.settings.supabaseUrl) localStorage.setItem('metasync_supabase_url', parsed.settings.supabaseUrl);
      if (parsed.settings.metaAccount) localStorage.setItem('metasync_meta_account', parsed.settings.metaAccount);
      if (parsed.settings.telegramChat) localStorage.setItem('metasync_telegram_chat', parsed.settings.telegramChat);
    }

    return { 
      success: true, 
      campaignsCount: workData.campaigns?.length || 0,
      reportsCount: workData.reportRecords?.length || 0
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Anti-Overwrite Guard: Safely merges remote data with local user campaigns
 * Ensures local custom-created campaigns are never wiped if remote doesn't contain them
 */
export function safeMergeCampaigns(localCampaigns, incomingCampaigns) {
  if (!incomingCampaigns || incomingCampaigns.length === 0) {
    return localCampaigns; // Never overwrite with empty
  }

  const incomingMap = new Map(incomingCampaigns.map(c => [c.id || c.meta_campaign_id, c]));
  const merged = [];

  // Update existing campaigns, preserving local custom state if needed
  for (const local of localCampaigns) {
    const matched = incomingMap.get(local.id) || incomingMap.get(local.meta_campaign_id);
    if (matched) {
      merged.push({
        ...local,
        ...matched,
        // Preserve user pricing if remote has zero
        base_price: matched.base_price > 0 ? matched.base_price : local.base_price,
        cogs: matched.cogs > 0 ? matched.cogs : local.cogs,
        // Preserve adsets if remote has none
        adsets: (matched.adsets && matched.adsets.length > 0) ? matched.adsets : local.adsets
      });
      incomingMap.delete(local.id || local.meta_campaign_id);
    } else {
      // Local custom campaign not in remote -> PROTECT IT!
      merged.push(local);
    }
  }

  // Add any completely new incoming campaigns
  for (const [_, incoming] of incomingMap) {
    merged.push(incoming);
  }

  return merged;
}
