'use server';

import { supabaseServer } from '@/lib/supabase/server';

/**
 * User chooses to connect. If both have connected, move to blind_mail.
 */
export async function connectMatch(matchId: string, userId: string) {
	const supabase = supabaseServer();

	const { error: upsertError } = await supabase
		.from('match_decisions')
		.upsert({ match_id: matchId, user_id: userId, decision: 'unlock_chat' }, { onConflict: 'match_id,user_id,decision' });
	if (upsertError) throw upsertError;

	const { data: decisions, error } = await supabase
		.from('match_decisions')
		.select('user_id')
		.eq('match_id', matchId)
		.eq('decision', 'unlock_chat');
	if (error) throw error;

	if ((decisions?.length ?? 0) >= 2) {
		const { error: statusError } = await supabase
			.from('matches')
			.update({ status: 'blind_mail' })
			.eq('id', matchId)
			.neq('status', 'rejected');
		if (statusError) throw statusError;
	}

	return { ok: true };
}

/** User skips the match: set status rejected */
export async function skipMatch(matchId: string) {
	const supabase = supabaseServer();
	const { error } = await supabase.from('matches').update({ status: 'rejected' }).eq('id', matchId);
	if (error) throw error;
	return { ok: true };
}

/** Unlock chat when letter requirement is satisfied */
export async function unlockChat(matchId: string) {
	const supabase = supabaseServer();
	const { error } = await supabase
		.from('matches')
		.update({ status: 'chat_unlocked' })
		.eq('id', matchId)
		.neq('status', 'rejected');
	if (error) throw error;
	return { ok: true };
}

/**
 * Simple matchmaking stub: if user already has an active match, return it; otherwise create with the first available partner.
 */
export async function findOrCreateMatchForUser(userId: string) {
	const supabase = supabaseServer();

	const { data: existing, error: existingError } = await supabase
		.from('matches')
		.select('id, status')
		.or(`user_a.eq.${userId},user_b.eq.${userId}`)
		.not('status', 'eq', 'rejected')
		.order('created_at', { ascending: false })
		.limit(1);
	if (existingError) throw existingError;
	if (existing && existing.length > 0) {
		return { ok: true, matchId: existing[0].id, status: existing[0].status };
	}

	const { data: partnerCandidates, error: partnerError } = await supabase
		.from('profiles')
		.select('user_id')
		.neq('user_id', userId)
		.limit(1);
	if (partnerError) throw partnerError;
	const partnerId = partnerCandidates?.[0]?.user_id;
	if (!partnerId) throw new Error('No partner available');

	const { data: inserted, error: insertError } = await supabase
		.from('matches')
		.insert({ user_a: userId, user_b: partnerId, status: 'pending' })
		.select('id, status')
		.single();
	if (insertError) throw insertError;

	return { ok: true, matchId: inserted.id, status: inserted.status };
}
