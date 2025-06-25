const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupStorage() {
  try {
    console.log('Setting up Supabase storage...');

    // Create avatars bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('Avatars bucket already exists');
      } else {
        throw bucketError;
      }
    } else {
      console.log('Created avatars bucket successfully');
    }

    // Set up RLS policies for the bucket
    const { error: policyError } = await supabase.storage.from('avatars').createPolicy(
      'Public read access',
      'SELECT',
      'public',
      'true'
    );

    if (policyError) {
      if (policyError.message.includes('already exists')) {
        console.log('Public read policy already exists');
      } else {
        console.error('Error creating public read policy:', policyError);
      }
    } else {
      console.log('Created public read policy');
    }

    // Allow authenticated users to upload
    const { error: uploadPolicyError } = await supabase.storage.from('avatars').createPolicy(
      'Authenticated users can upload',
      'INSERT',
      'authenticated',
      'true'
    );

    if (uploadPolicyError) {
      if (uploadPolicyError.message.includes('already exists')) {
        console.log('Upload policy already exists');
      } else {
        console.error('Error creating upload policy:', uploadPolicyError);
      }
    } else {
      console.log('Created upload policy');
    }

    // Allow users to update their own avatars
    const { error: updatePolicyError } = await supabase.storage.from('avatars').createPolicy(
      'Users can update their own avatars',
      'UPDATE',
      'authenticated',
      'auth.uid()::text = (storage.foldername(name))[1]'
    );

    if (updatePolicyError) {
      if (updatePolicyError.message.includes('already exists')) {
        console.log('Update policy already exists');
      } else {
        console.error('Error creating update policy:', updatePolicyError);
      }
    } else {
      console.log('Created update policy');
    }

    console.log('Storage setup completed successfully!');
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
}

setupStorage(); 