'use server';

import { supabaseServer } from '@/lib/supabase/server';

/**
 * When user clicks Reveal, we insert a decision row (or upsert) and if both decided, flip match to revealed.
 */
export async function requestReveal(matchId: string, userId: string) {
	const supabase = supabaseServer();

	const { data: match, error: matchError } = await supabase
		.from('matches')
		.select('id, status, user_a, user_b, created_at')
		.eq('id', matchId)
		.maybeSingle();
	if (matchError) throw matchError;
	if (!match) throw new Error('Match not found');
	if (match.user_a !== userId && match.user_b !== userId) throw new Error('Not your match');

	const now = Date.now();
	const daysSinceStart = match.created_at ? Math.floor((now - new Date(match.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

	const { count: messageCount, error: countError } = await supabase
		.from('messages')
		.select('id', { count: 'exact', head: true })
		.eq('match_id', matchId);
	if (countError) throw countError;

	const eligible = (messageCount ?? 0) >= 50 || daysSinceStart >= 3 || match.status === 'revealed';
	if (!eligible) throw new Error('Reveal not available yet');

	const { error: insertError } = await supabase
		.from('match_decisions')
		.upsert({ match_id: matchId, user_id: userId, decision: 'reveal' }, { onConflict: 'match_id,user_id,decision' });
	if (insertError) throw insertError;

	const { data: decisions, error } = await supabase
		.from('match_decisions')
		.select('user_id')
		.eq('match_id', matchId)
		.eq('decision', 'reveal');
	if (error) throw error;

	if ((decisions?.length ?? 0) >= 2) {
		const { error: updateError } = await supabase
			.from('matches')
			.update({ status: 'revealed' })
			.eq('id', matchId);
		if (updateError) throw updateError;
	}

	return { ok: true, messageCount: messageCount ?? 0, daysSinceStart };
}
