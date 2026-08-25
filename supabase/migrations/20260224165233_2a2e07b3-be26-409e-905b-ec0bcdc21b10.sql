
-- Add server-side validation constraints for meetings table
ALTER TABLE public.meetings
  ADD CONSTRAINT check_name_length CHECK (length(name) >= 2 AND length(name) <= 100),
  ADD CONSTRAINT check_email_length CHECK (length(email) <= 255),
  ADD CONSTRAINT check_phone_length CHECK (phone IS NULL OR length(phone) <= 20),
  ADD CONSTRAINT check_topic_length CHECK (length(topic) >= 1 AND length(topic) <= 200),
  ADD CONSTRAINT check_notes_length CHECK (notes IS NULL OR length(notes) <= 1000);

-- Add server-side validation constraints for rfqs table
ALTER TABLE public.rfqs
  ADD CONSTRAINT check_rfq_customer_length CHECK (customer IS NULL OR length(customer) <= 200),
  ADD CONSTRAINT check_rfq_company_length CHECK (company IS NULL OR length(company) <= 200),
  ADD CONSTRAINT check_rfq_email_length CHECK (email IS NULL OR length(email) <= 255),
  ADD CONSTRAINT check_rfq_notes_length CHECK (notes IS NULL OR length(notes) <= 2000),
  ADD CONSTRAINT check_rfq_quantity_positive CHECK (quantity IS NULL OR quantity > 0),
  ADD CONSTRAINT check_rfq_service_length CHECK (service IS NULL OR length(service) <= 100),
  ADD CONSTRAINT check_rfq_material_length CHECK (material IS NULL OR length(material) <= 100);
