-- Enable Row Level Security on all provider-related tables
ALTER TABLE "Provider" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactInformation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServicesOffered" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TrainingAndEducation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AccessibilityAndInclusion" ENABLE ROW LEVEL SECURITY;

-- Provider policies: Authenticated users can read, admin can write
CREATE POLICY "Authenticated users can read providers"
  ON "Provider" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert providers"
  ON "Provider" FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update providers"
  ON "Provider" FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete providers"
  ON "Provider" FOR DELETE
  TO service_role
  USING (true);

-- Address policies
CREATE POLICY "Authenticated users can read addresses"
  ON "Address" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage addresses"
  ON "Address" FOR ALL
  TO service_role
  USING (true);

-- ContactInformation policies
CREATE POLICY "Authenticated users can read contact information"
  ON "ContactInformation" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage contact information"
  ON "ContactInformation" FOR ALL
  TO service_role
  USING (true);

-- Contact policies
CREATE POLICY "Authenticated users can read contacts"
  ON "Contact" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage contacts"
  ON "Contact" FOR ALL
  TO service_role
  USING (true);

-- ServicesOffered policies
CREATE POLICY "Authenticated users can read services"
  ON "ServicesOffered" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage services"
  ON "ServicesOffered" FOR ALL
  TO service_role
  USING (true);

-- TrainingAndEducation policies
CREATE POLICY "Authenticated users can read training"
  ON "TrainingAndEducation" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage training"
  ON "TrainingAndEducation" FOR ALL
  TO service_role
  USING (true);

-- AccessibilityAndInclusion policies
CREATE POLICY "Authenticated users can read accessibility"
  ON "AccessibilityAndInclusion" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage accessibility"
  ON "AccessibilityAndInclusion" FOR ALL
  TO service_role
  USING (true);
