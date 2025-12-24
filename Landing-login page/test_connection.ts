import { supabase } from './lib/supabaseClient.ts';

console.log('=== Supabase Connection Test ===\n');

// Check environment variables
console.log('Environment Variables:');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key (first 30 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 30) + '...');
console.log('');

// Test connection
async function testConnection() {
    try {
        console.log('Testing connection to profiles table...');

        const { data, error, count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact' });

        if (error) {
            console.error('❌ Error:', error);
            return;
        }

        console.log(`✅ Successfully connected!`);
        console.log(`Found ${count} profiles\n`);

        if (data && data.length > 0) {
            console.log('Sample profiles:');
            data.slice(0, 5).forEach((profile, index) => {
                console.log(`\n${index + 1}. ${profile.full_name || 'No name'}`);
                console.log(`   Email: ${profile.email || 'No email'}`);
                console.log(`   Role: ${profile.role || 'No role'}`);
                console.log(`   Is Team Lead: ${profile.is_teamlead ? 'Yes' : 'No'}`);
            });
        }

        // Group by role
        console.log('\n\nProfiles by Role:');
        console.log('─────────────────');

        const roles = {};
        data.forEach(profile => {
            const role = profile.role || 'Unknown';
            if (!roles[role]) {
                roles[role] = [];
            }
            roles[role].push(profile);
        });

        Object.entries(roles).forEach(([role, profiles]) => {
            console.log(`\n${role}: ${profiles.length} user(s)`);
            profiles.forEach(p => {
                console.log(`  • ${p.email}`);
            });
        });

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

testConnection();
