-- Rename existing merch products in place from the dummy DVBBS / Tsunami /
-- Roadtrip / Heritage names to the on-brand Kanary line. SKUs are also
-- updated to match. Paste in the Supabase SQL editor and run.

update public.merch_products
  set name = 'Kanary Tee', sku = 'KANARY-TEE-BLK',
      notes = 'Black 100% cotton tee with embroidered Kanary mark. Heavyweight 240gsm.'
  where sku = 'DVBBS-TEE-BLK';

update public.merch_products
  set name = 'Kanary Hoodie', sku = 'KANARY-HOOD-CRM',
      notes = 'Cream pullover, oversized fit. Kanary wordmark across the back.'
  where sku = 'DVBBS-HOOD-CRM';

update public.merch_products
  set name = 'Kanary Cap', sku = 'KANARY-CAP-BLK',
      notes = 'Black six-panel snapback. Embroidered Kanary mark on the front.'
  where sku = 'DVBBS-CAP-BLK';

update public.merch_products
  set name = 'Kanary 12" Vinyl', sku = 'KANARY-VIN-01',
      notes = 'Limited 1,000-press translucent blue vinyl. Kanary AAA-side cut.'
  where sku = 'DVBBS-VIN-TSU';

update public.merch_products
  set name = 'Kanary Crewneck', sku = 'KANARY-CREW-OLV',
      notes = 'Olive heavyweight crewneck with Kanary tour route on the back.'
  where sku = 'DVBBS-CREW-OLV';

update public.merch_products
  set name = 'Kanary Mainstage Tee', sku = 'KANARY-TML-26',
      notes = 'Limited tour-exclusive Kanary tee for the Tomorrowland mainstage 2026.'
  where sku = 'DVBBS-TML-26';

update public.merch_products
  set name = 'Kanary Tote', sku = 'KANARY-TOTE',
      notes = 'Natural canvas tote with screen-printed Kanary mark.'
  where sku = 'DVBBS-TOTE';
