-- Table: public.aggtotal

CREATE TABLE public.aggtotal
(
    bid integer,
    objectid_1 integer,
    objectid integer,
    incident_date timestamp with time zone,
    incident_reported_date timestamp with time zone,
    category character varying(8000) COLLATE pg_catalog."default",
    stat integer,
    address character varying(8000) COLLATE pg_catalog."default",
    street character varying(8000) COLLATE pg_catalog."default",
    city character varying(8000) COLLATE pg_catalog."default",
    zip integer,
    incident_id character varying(8000) COLLATE pg_catalog."default",
    reporting_district integer,
    seq integer,
    gang_related character varying(8000) COLLATE pg_catalog."default",
    latlng geometry
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
