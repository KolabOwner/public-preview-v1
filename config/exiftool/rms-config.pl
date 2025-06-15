# ExifTool configuration for Resume Metadata Standard (RMS)
# This configuration file defines custom XMP tags for resume metadata
# Usage: exiftool -config rms-config.pl [options] file.pdf

%Image::ExifTool::UserDefined = (
    'Image::ExifTool::XMP::Main' => {
        rms => { # <-- must be the same as the NAMESPACE prefix
            SubDirectory => {
                TagTable => 'Image::ExifTool::UserDefined::rms', # (see the definition of this table below)
            },
        },
    },
);

%Image::ExifTool::UserDefined::rms = (
    GROUPS        => { 0 => 'XMP', 1 => 'XMP-rms', 2 => 'Image' },
    NAMESPACE     => { 'rms' => 'https://github.com/rezi-io/resume-standard' },
    WRITABLE      => 'string',

    # Essential fields (Producer should be PDF metadata, not RMS)
    "rms_schema_detail"        => { Writable => 'string' },
    "rms_version"              => { Writable => 'string' },

    # Contact Information
    "rms_contact_fullName"         => { Writable => 'string' },
    "rms_contact_givenNames"       => { Writable => 'string' },
    "rms_contact_lastName"         => { Writable => 'string' },
    "rms_contact_email"            => { Writable => 'string' },
    "rms_contact_phone"            => { Writable => 'string' },
    "rms_contact_linkedin"         => { Writable => 'string' },
    "rms_contact_github"           => { Writable => 'string' },
    "rms_contact_dribble"          => { Writable => 'string' },
    "rms_contact_behance"          => { Writable => 'string' },
    "rms_contact_website"          => { Writable => 'string' },
    "rms_contact_country"          => { Writable => 'string' },
    "rms_contact_countryCode"      => { Writable => 'string' },
    "rms_contact_city"             => { Writable => 'string' },
    "rms_contact_state"            => { Writable => 'string' },

    # Summary
    "rms_summary"                  => { Writable => 'string' },

    # Item Counts
    "rms_experience_count"         => { Writable => 'integer' },
    "rms_education_count"          => { Writable => 'integer' },
    "rms_certification_count"      => { Writable => 'integer' },
    "rms_coursework_count"         => { Writable => 'integer' },
    "rms_involvement_count"        => { Writable => 'integer' },
    "rms_project_count"            => { Writable => 'integer' },
    "rms_skill_count"              => { Writable => 'integer' },
    "rms_publication_count"        => { Writable => 'integer' },
    "rms_award_count"              => { Writable => 'integer' },
    "rms_reference_count"          => { Writable => 'integer' },
);

# Dynamic field generation for indexed items (0-15)
foreach my $i (0..15) {
    # Experience fields
    $Image::ExifTool::UserDefined::rms{"rms_experience_${i}_company"}     = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_experience_${i}_role"}        = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_experience_${i}_location"}    = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_experience_${i}_description"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_experience_${i}_dateBegin"}   = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_experience_${i}_dateBeginTS"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_experience_${i}_dateBeginFormat"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_experience_${i}_dateEnd"}     = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_experience_${i}_dateEndTS"}   = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_experience_${i}_dateEndFormat"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_experience_${i}_isCurrent"}   = { Writable => 'string' };

    # Education fields
    $Image::ExifTool::UserDefined::rms{"rms_education_${i}_institution"}  = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_education_${i}_qualification"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_education_${i}_location"}     = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_education_${i}_date"}         = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_education_${i}_dateTS"}       = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_education_${i}_dateFormat"}   = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_education_${i}_isGraduate"}   = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_education_${i}_minor"}        = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_education_${i}_score"}        = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_education_${i}_scoreType"}    = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_education_${i}_description"}  = { Writable => 'string' };

    # Certification fields
    $Image::ExifTool::UserDefined::rms{"rms_certification_${i}_name"}     = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_certification_${i}_department"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_certification_${i}_date"}     = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_certification_${i}_dateTS"}   = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_certification_${i}_dateFormat"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_certification_${i}_description"} = { Writable => 'string' };

    # Coursework fields
    $Image::ExifTool::UserDefined::rms{"rms_coursework_${i}_name"}        = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_coursework_${i}_department"}  = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_coursework_${i}_date"}        = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_coursework_${i}_dateTS"}      = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_coursework_${i}_dateFormat"}  = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_coursework_${i}_description"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_coursework_${i}_skill"}       = { Writable => 'string' };

    # Involvement fields
    $Image::ExifTool::UserDefined::rms{"rms_involvement_${i}_organization"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_involvement_${i}_location"}   = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_involvement_${i}_role"}       = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_involvement_${i}_dateBegin"}  = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_involvement_${i}_dateBeginTS"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_involvement_${i}_dateBeginFormat"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_involvement_${i}_dateEnd"}    = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_involvement_${i}_dateEndTS"}  = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_involvement_${i}_dateEndFormat"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_involvement_${i}_description"} = { Writable => 'string' };

    # Project fields
    $Image::ExifTool::UserDefined::rms{"rms_project_${i}_title"}          = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_project_${i}_organization"}   = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_project_${i}_role"}           = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_project_${i}_dateBegin"}      = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_project_${i}_dateBeginTS"}    = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_project_${i}_dateBeginFormat"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_project_${i}_dateEnd"}        = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_project_${i}_dateEndTS"}      = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_project_${i}_dateEndFormat"}  = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_project_${i}_description"}    = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_project_${i}_url"}            = { Writable => 'string' };

    # Skill fields
    $Image::ExifTool::UserDefined::rms{"rms_skill_${i}_category"}         = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_skill_${i}_keywords"}         = { Writable => 'string' };

    # Publication fields
    $Image::ExifTool::UserDefined::rms{"rms_publication_${i}_title"}      = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_publication_${i}_organization"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_publication_${i}_role"}       = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_publication_${i}_date"}       = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_publication_${i}_dateTS"}     = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_publication_${i}_dateFormat"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_publication_${i}_description"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_publication_${i}_type"}       = { Writable => 'string' };

    # Award fields
    $Image::ExifTool::UserDefined::rms{"rms_award_${i}_title"}      = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_award_${i}_organization"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_award_${i}_date"}       = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_award_${i}_dateTS"}     = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_award_${i}_dateFormat"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_award_${i}_description"} = { Writable => 'string' };

    # Reference fields
    $Image::ExifTool::UserDefined::rms{"rms_reference_${i}_name"}         = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_reference_${i}_phone"}        = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_reference_${i}_email"}        = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_reference_${i}_type"}         = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_reference_${i}_organization"} = { Writable => 'string' };
    $Image::ExifTool::UserDefined::rms{"rms_reference_${i}_role"}         = { Writable => 'string' };
}

#------------------------------------------------------------------------------
1;  #end