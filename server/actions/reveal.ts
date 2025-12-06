'use server';

import { supabaseServer } from '@/lib/supabase/server';

/**
 * When user clicks Reveal, we insert a decision row (or upsert) and if both decided, flip match to revealed.
 */
export async function requestReveal(matchId: string, userId: string) {
	const supabase = supabaseServer();

	// Record this user's reveal intent
	const { error: insertError } = await supabase
		.from('match_decisions')
		.upsert({ match_id: matchId, user_id: userId, decision: 'reveal' }, { onConflict: 'match_id,user_id,decision' });
	if (insertError) throw insertError;

	// Check if partner also revealed
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

	return { ok: true };
}
