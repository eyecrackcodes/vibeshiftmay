-- Create the SOS_Requests table
CREATE TABLE IF NOT EXISTS "SOS_Requests" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'cancelled')),
  location TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE "SOS_Requests" ENABLE ROW LEVEL SECURITY;

-- Create policies for SOS_Requests
-- Allow users to create their own SOS requests
CREATE POLICY "Users can create their own SOS requests"
  ON "SOS_Requests"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own SOS requests
CREATE POLICY "Users can view their own SOS requests"
  ON "SOS_Requests"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to update their own SOS requests
CREATE POLICY "Users can update their own SOS requests"
  ON "SOS_Requests"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS sos_requests_user_id_idx ON "SOS_Requests" (user_id);
CREATE INDEX IF NOT EXISTS sos_requests_status_idx ON "SOS_Requests" (status);

-- Comment on table and columns
COMMENT ON TABLE "SOS_Requests" IS 'Table to store emergency help requests from users';
COMMENT ON COLUMN "SOS_Requests".id IS 'Unique identifier for the SOS request';
COMMENT ON COLUMN "SOS_Requests".user_id IS 'Reference to the user who created the SOS request';
COMMENT ON COLUMN "SOS_Requests".status IS 'Status of the SOS request: active, resolved, or cancelled';
COMMENT ON COLUMN "SOS_Requests".location IS 'Optional location information of the user';
COMMENT ON COLUMN "SOS_Requests".description IS 'Description of the emergency or reason for the SOS request';
COMMENT ON COLUMN "SOS_Requests".created_at IS 'Timestamp when the SOS request was created';
COMMENT ON COLUMN "SOS_Requests".updated_at IS 'Timestamp when the SOS request was last updated'; 