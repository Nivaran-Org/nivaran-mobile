import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useComplaints, Complaint } from "../../contexts/ComplaintsContext";
import { useAuth } from "../../contexts/AuthContext";

// ── UID Generator ─────────────────────────────────────────────────────────────
const generateUID = (): string => {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `GRV-${date}-${rand}`;
};

// ── Constants ────────────────────────────────────────────────────────────────
const COMPLAINT_CATEGORIES = [
  { id: "water_leak",  label: "Water Leak",  icon: "water"              },
  { id: "electricity", label: "Electricity", icon: "flash"              },
  { id: "road_damage", label: "Road Damage", icon: "car"                },
  { id: "sanitation",  label: "Sanitation",  icon: "trash"              },
  { id: "other",       label: "Other",       icon: "ellipsis-horizontal" },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  pending:       { color: "#E65100", bg: "#FFF3E0", label: "PENDING",     icon: "time-outline"             },
  "in-progress": { color: "#0D47A1", bg: "#E3F2FD", label: "IN PROGRESS", icon: "reload-circle-outline"    },
  resolved:      { color: "#1B5E20", bg: "#E8F5E9", label: "RESOLVED",    icon: "checkmark-circle-outline" },
  rejected:      { color: "#B71C1C", bg: "#FFEBEE", label: "REJECTED",    icon: "close-circle-outline"     },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  Low:      { color: "#546E7A", bg: "#ECEFF1", label: "Low"      },
  Medium:   { color: "#F57C00", bg: "#FFF8E1", label: "Medium"   },
  High:     { color: "#E53935", bg: "#FFEBEE", label: "High"     },
  Critical: { color: "#B71C1C", bg: "#FCE4EC", label: "Critical" },
};

const TEAM_MEMBERS = [
  { id: "T1", name: "Inspector Harpreet Kaur",    dept: "Traffic & Roads",  initials: "HK", color: "#0D47A1" },
  { id: "T2", name: "Sub-Inspector Gurjeet Singh", dept: "Sanitation",       initials: "GS", color: "#1B5E20" },
  { id: "T3", name: "ASI Mandeep Sharma",          dept: "Public Safety",    initials: "MS", color: "#6A1B9A" },
  { id: "T4", name: "Constable Amritpal Dhillon",  dept: "Water Supply",     initials: "AD", color: "#E65100" },
  { id: "T5", name: "Constable Simran Grewal",     dept: "Electricity",      initials: "SG", color: "#F57C00" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ReportScreen() {
  const { complaints, addComplaint, updateComplaint } = useComplaints();
  const { user } = useAuth();

  // ── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"submit" | "track">("submit");

  // ── Submit form ────────────────────────────────────────────────────────────
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [location,    setLocation]    = useState("");
  const [category,    setCategory]    = useState("");
  const [photos,      setPhotos]      = useState<string[]>([]);
  const [submitting,  setSubmitting]  = useState(false);
  const [lastUID,     setLastUID]     = useState<string | null>(null);

  // ── Track ──────────────────────────────────────────────────────────────────
  const [searchUID,       setSearchUID]       = useState("");
  const [searchResult,    setSearchResult]    = useState<Complaint | null>(null);
  const [searched,        setSearched]        = useState(false);

  // ── Officer Resolution Panel ───────────────────────────────────────────────
  const [officerNote,       setOfficerNote]       = useState("");
  const [newStatus,         setNewStatus]         = useState<string>("");
  const [newPriority,       setNewPriority]       = useState<string>("");
  const [assignedMember,    setAssignedMember]    = useState<string>("");
  const [resolutionPhotos,  setResolutionPhotos]  = useState<string[]>([]);
  const [rejectionReason,   setRejectionReason]   = useState("");
  const [saving,            setSaving]            = useState(false);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showStatusModal,   setShowStatusModal]   = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showTeamModal,     setShowTeamModal]     = useState(false);

  // ── Filter (track tab) ─────────────────────────────────────────────────────
  const [filterStatus,   setFilterStatus]   = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy,         setSortBy]         = useState<"newest" | "oldest" | "priority">("newest");
  const [showFilters,    setShowFilters]     = useState(false);

  // ── Photo helpers ──────────────────────────────────────────────────────────
  const pickPhotos = async (setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[]) => {
    Alert.alert("Add Photo", "Choose an option", [
      {
        text: "Take Photo",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") { Alert.alert("Permission Required", "Camera access is needed."); return; }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
          if (!result.canceled && result.assets[0]) setter((prev) => [...prev, result.assets[0].uri]);
        },
      },
      {
        text: "Choose from Gallery",
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") { Alert.alert("Permission Required", "Gallery access is needed."); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8, selectionLimit: 5 });
          if (!result.canceled) setter((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 5));
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim())       { Alert.alert("Required", "Please enter a complaint title."); return; }
    if (!category)           { Alert.alert("Required", "Please select a category.");       return; }
    if (!description.trim()) { Alert.alert("Required", "Please describe the complaint.");  return; }

    setSubmitting(true);
    const uid = generateUID();

    const newComplaint: Complaint = {
      id:           uid,
      title,
      description,
      category,
      location:     location ? ({ address: location, latitude: 0, longitude: 0 } as any) : undefined,
      status:       "pending",
      priority:     "Medium",
      citizenName:  user?.displayName || "Citizen",
      citizenPhone: user?.phone       || "",
      createdAt:    new Date(),
      photos,
      officerNote:  "",
      aiRouting:    "",
    };

    addComplaint(newComplaint);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setLastUID(uid);

    Alert.alert(
      "✅ Complaint Submitted",
      `Your Grievance ID is:\n\n${uid}\n\nSave this to track your complaint.`,
      [{
        text: "Done",
        onPress: () => { setTitle(""); setDescription(""); setLocation(""); setCategory(""); setPhotos([]); },
      }]
    );
  };

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    const trimmed = searchUID.trim().toUpperCase();
    if (!trimmed) { Alert.alert("Enter UID", "Please enter a Grievance ID."); return; }
    const found = complaints.find((c) => c.id.toUpperCase() === trimmed) || null;
    setSearchResult(found);
    setSearched(true);
    if (found) {
      setOfficerNote(found.officerNote || "");
      setNewStatus(found.status);
      setNewPriority(found.priority || "Medium");
      setAssignedMember((found as any).assignedTo || "");
      setResolutionPhotos((found as any).resolutionPhotos || []);
      setRejectionReason((found as any).rejectionReason || "");
    }
  };

  // ── Save Officer Update ────────────────────────────────────────────────────
  const handleSaveUpdate = async () => {
    if (!searchResult) return;
    if (newStatus === "rejected" && !rejectionReason.trim()) {
      Alert.alert("Required", "Please enter a reason for rejection.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));

    const updated = {
      ...searchResult,
      status:           newStatus,
      priority:         newPriority,
      officerNote:      officerNote.trim(),
      assignedTo:       assignedMember,
      resolutionPhotos: resolutionPhotos,
      rejectionReason:  newStatus === "rejected" ? rejectionReason.trim() : "",
      updatedAt:        new Date(),
    };

    updateComplaint(updated);
    setSearchResult(updated as Complaint);
    setSaving(false);

    Alert.alert(
      "✅ Updated",
      `Complaint ${searchResult.id} has been updated successfully.`,
    );
  };

  // ── Filtered complaints list (Track tab browse) ────────────────────────────
  const filteredComplaints = complaints
    .filter((c) => filterStatus === "all"    || c.status   === filterStatus)
    .filter((c) => filterCategory === "all"  || c.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
             (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2);
    });

  // ── Submit Tab ─────────────────────────────────────────────────────────────
  const renderSubmitTab = () => (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.tabContent}>
      {lastUID && (
        <View style={styles.uidBanner}>
          <Ionicons name="bookmark" size={15} color="#1B5E20" />
          <Text style={styles.uidBannerText}>Last ID: <Text style={styles.uidBannerUID}>{lastUID}</Text></Text>
          <TouchableOpacity onPress={() => { setSearchUID(lastUID); setActiveTab("track"); }}>
            <Text style={styles.uidBannerLink}>Track →</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Category *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {COMPLAINT_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, category === cat.id && styles.categoryChipActive]}
            onPress={() => setCategory(cat.id)}
          >
            <Ionicons name={cat.icon as any} size={15} color={category === cat.id ? "#fff" : "#555"} />
            <Text style={[styles.categoryChipText, category === cat.id && styles.categoryChipTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Complaint Title *</Text>
      <TextInput style={styles.input} placeholder="e.g. Water leaking from main pipe" placeholderTextColor="#aaa" value={title} onChangeText={setTitle} maxLength={100} />

      <Text style={styles.label}>Location</Text>
      <TextInput style={styles.input} placeholder="e.g. Block C, Street 4, Near Park" placeholderTextColor="#aaa" value={location} onChangeText={setLocation} />

      <Text style={styles.label}>Description *</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the issue in detail..." placeholderTextColor="#aaa" value={description} onChangeText={setDescription} multiline numberOfLines={5} textAlignVertical="top" maxLength={500} />
      <Text style={styles.charCount}>{description.length}/500</Text>

      <Text style={styles.label}>Photos of Issue (up to 5)</Text>
      <View style={styles.photoGrid}>
        {photos.map((uri, index) => (
          <View key={index} style={styles.photoWrapper}>
            <Image source={{ uri }} style={styles.photoThumb} />
            <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}>
              <Ionicons name="close-circle" size={22} color="#E53935" />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < 5 && (
          <TouchableOpacity style={styles.addPhotoBtn} onPress={() => pickPhotos(setPhotos, photos)}>
            <Ionicons name="camera" size={26} color="#1565C0" />
            <Text style={styles.addPhotoBtnText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitting}>
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <><Ionicons name="send" size={18} color="#fff" /><Text style={styles.submitBtnText}>Submit Complaint</Text></>
        }
      </TouchableOpacity>
    </ScrollView>
  );

  // ── Track Tab ──────────────────────────────────────────────────────────────
  const renderTrackTab = () => {
    const cfg       = searchResult ? (STATUS_CONFIG[searchResult.status] ?? STATUS_CONFIG.pending) : null;
    const stepIndex = searchResult?.status === "pending" ? 0 : searchResult?.status === "in-progress" ? 1 : 2;

    return (
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.tabContent}>

        {/* Search Box */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="GRV-YYYYMMDD-XXXX"
            placeholderTextColor="#aaa"
            value={searchUID}
            onChangeText={(t) => { setSearchUID(t); setSearched(false); setSearchResult(null); }}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Filter Bar ── */}
        <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options-outline" size={16} color="#0A2342" />
          <Text style={styles.filterToggleText}>Filter & Sort</Text>
          <View style={styles.filterCountBadge}>
            <Text style={styles.filterCountText}>{filteredComplaints.length}</Text>
          </View>
          <Ionicons name={showFilters ? "chevron-up" : "chevron-down"} size={14} color="#90A4AE" />
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterLabel}>STATUS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {["all", "pending", "in-progress", "resolved", "rejected"].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
                  onPress={() => setFilterStatus(s)}
                >
                  <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>
                    {s === "all" ? "All" : STATUS_CONFIG[s]?.label ?? s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {[{ id: "all", label: "All" }, ...COMPLAINT_CATEGORIES].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.filterChip, filterCategory === cat.id && styles.filterChipActive]}
                  onPress={() => setFilterCategory(cat.id)}
                >
                  <Text style={[styles.filterChipText, filterCategory === cat.id && styles.filterChipTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>SORT BY</Text>
            <View style={styles.sortRow}>
              {(["newest", "oldest", "priority"] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sortChip, sortBy === s && styles.sortChipActive]}
                  onPress={() => setSortBy(s)}
                >
                  <Text style={[styles.sortChipText, sortBy === s && styles.sortChipTextActive]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Complaints List ── */}
        {!searched && filteredComplaints.length > 0 && (
          <View style={styles.complaintsList}>
            <Text style={styles.listHeader}>ALL COMPLAINTS ({filteredComplaints.length})</Text>
            {filteredComplaints.map((c) => {
              const scfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.pending;
              const pcfg = PRIORITY_CONFIG[c.priority] ?? PRIORITY_CONFIG.Medium;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={styles.complaintListItem}
                  onPress={() => { setSearchUID(c.id); setSearchResult(c); setSearched(true); setOfficerNote(c.officerNote || ""); setNewStatus(c.status); setNewPriority(c.priority || "Medium"); setAssignedMember((c as any).assignedTo || ""); setResolutionPhotos((c as any).resolutionPhotos || []); setRejectionReason((c as any).rejectionReason || ""); }}
                  activeOpacity={0.8}
                >
                  <View style={styles.listItemLeft}>
                    <View style={[styles.listStatusDot, { backgroundColor: scfg.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listItemTitle} numberOfLines={1}>{c.title}</Text>
                      <Text style={styles.listItemUID}>{c.id}</Text>
                      <View style={styles.listItemMeta}>
                        <View style={[styles.listStatusBadge, { backgroundColor: scfg.bg }]}>
                          <Text style={[styles.listStatusText, { color: scfg.color }]}>{scfg.label}</Text>
                        </View>
                        <View style={[styles.listPriorityBadge, { backgroundColor: pcfg.bg }]}>
                          <Text style={[styles.listPriorityText, { color: pcfg.color }]}>{pcfg.label}</Text>
                        </View>
                        <Text style={styles.listItemDate}>
                          {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#B0BEC5" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Not Found */}
        {searched && !searchResult && (
          <View style={styles.notFound}>
            <Ionicons name="alert-circle-outline" size={44} color="#E53935" />
            <Text style={styles.notFoundTitle}>No complaint found</Text>
            <Text style={styles.notFoundSub}>Check the ID and try again. Format: GRV-20260427-A3F9</Text>
          </View>
        )}

        {/* ── Result Card + Officer Panel ── */}
        {searchResult && cfg && (
          <View>
            {/* Back to list */}
            <TouchableOpacity style={styles.backToList} onPress={() => { setSearched(false); setSearchResult(null); setSearchUID(""); }}>
              <Ionicons name="arrow-back" size={14} color="#0D47A1" />
              <Text style={styles.backToListText}>Back to list</Text>
            </TouchableOpacity>

            {/* Complaint Details Card */}
            <View style={styles.resultCard}>
              <View style={styles.uidPill}>
                <Ionicons name="barcode-outline" size={13} color="#0D47A1" />
                <Text style={styles.uidPillText}>{searchResult.id}</Text>
              </View>
              <Text style={styles.resultTitle}>{searchResult.title}</Text>

              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
                <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>

              {/* Timeline */}
              <View style={styles.timeline}>
                {(["pending", "in-progress", "resolved"] as const).map((step, i) => {
                  const done = i <= stepIndex;
                  const labels = ["Submitted", "In Progress", "Resolved"];
                  const subs   = ["Complaint registered", "Assigned to department", "Issue fixed"];
                  return (
                    <View key={step} style={styles.timelineStep}>
                      <View style={styles.timelineLeft}>
                        <View style={[styles.timelineDot, done && { backgroundColor: cfg.color, borderColor: cfg.color }]}>
                          {done && <View style={styles.timelineDotInner} />}
                        </View>
                        {i < 2 && <View style={[styles.timelineLine, done && i < stepIndex && styles.timelineLineDone]} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={[styles.timelineLabel, done && styles.timelineLabelDone]}>{labels[i]}</Text>
                        <Text style={styles.timelineSub}>{subs[i]}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Details */}
              <View style={styles.detailBlock}>
                <DetailRow icon="pricetag-outline" label="Category" value={searchResult.category?.replace(/_/g, " ")} />
                {searchResult.location && (
                  <DetailRow icon="location-outline" label="Location"
                    value={(searchResult.location as any).address || `${(searchResult.location as any).latitude?.toFixed(4)}, ${(searchResult.location as any).longitude?.toFixed(4)}`} />
                )}
                <DetailRow icon="calendar-outline" label="Submitted"
                  value={new Date(searchResult.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
                <DetailRow icon="flag-outline" label="Priority" value={searchResult.priority} />
                <DetailRow icon="person-outline" label="Citizen" value={searchResult.citizenName} />
                {(searchResult as any).assignedTo && (
                  <DetailRow icon="shield-outline" label="Assigned"
                    value={TEAM_MEMBERS.find((m) => m.id === (searchResult as any).assignedTo)?.name || (searchResult as any).assignedTo} />
                )}
              </View>

              <Text style={styles.sectionMicro}>DESCRIPTION</Text>
              <Text style={styles.resultDesc}>{searchResult.description}</Text>

              {/* Complaint photos */}
              {searchResult.photos && searchResult.photos.length > 0 && (
                <>
                  <Text style={styles.sectionMicro}>COMPLAINT PHOTOS</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                      {searchResult.photos.map((uri: string, i: number) => (
                        <Image key={i} source={{ uri }} style={styles.trackPhoto} resizeMode="cover" />
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              {/* Previous officer note */}
              {!!searchResult.officerNote && (
                <View style={[styles.officerNoteBox, { marginTop: 14 }]}>
                  <Ionicons name="chatbox-ellipses-outline" size={14} color="#0D47A1" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.officerNoteLabel}>PREVIOUS OFFICER NOTE</Text>
                    <Text style={styles.officerNoteText}>{searchResult.officerNote}</Text>
                  </View>
                </View>
              )}

              {/* Rejection reason */}
              {!!(searchResult as any).rejectionReason && (
                <View style={[styles.officerNoteBox, { marginTop: 8, backgroundColor: "#FFEBEE", borderLeftColor: "#B71C1C" }]}>
                  <Ionicons name="close-circle-outline" size={14} color="#B71C1C" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.officerNoteLabel, { color: "#B71C1C" }]}>REJECTION REASON</Text>
                    <Text style={styles.officerNoteText}>{(searchResult as any).rejectionReason}</Text>
                  </View>
                </View>
              )}

              {/* Resolution photos */}
              {(searchResult as any).resolutionPhotos?.length > 0 && (
                <>
                  <Text style={[styles.sectionMicro, { marginTop: 14 }]}>RESOLUTION PHOTOS</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                      {(searchResult as any).resolutionPhotos.map((uri: string, i: number) => (
                        <Image key={i} source={{ uri }} style={styles.trackPhoto} resizeMode="cover" />
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}
            </View>

            {/* ── Officer Action Panel ── */}
            <View style={styles.officerPanel}>
              <View style={styles.officerPanelHeader}>
                <Ionicons name="shield-checkmark" size={16} color="#FFD700" />
                <Text style={styles.officerPanelTitle}>OFFICER ACTION PANEL</Text>
              </View>

              {/* Status Selector */}
              <Text style={styles.panelLabel}>Update Status</Text>
              <TouchableOpacity style={styles.selectorBtn} onPress={() => setShowStatusModal(true)}>
                <View style={[styles.selectorDot, { backgroundColor: STATUS_CONFIG[newStatus]?.color ?? "#aaa" }]} />
                <Text style={styles.selectorBtnText}>{STATUS_CONFIG[newStatus]?.label ?? "Select Status"}</Text>
                <Ionicons name="chevron-down" size={16} color="#90A4AE" />
              </TouchableOpacity>

              {/* Rejection Reason (only if rejected) */}
              {newStatus === "rejected" && (
                <>
                  <Text style={styles.panelLabel}>Rejection Reason *</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 0 }]}
                    placeholder="Explain why this complaint is being rejected..."
                    placeholderTextColor="#aaa"
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </>
              )}

              {/* Priority Selector */}
              <Text style={styles.panelLabel}>Set Priority</Text>
              <TouchableOpacity style={styles.selectorBtn} onPress={() => setShowPriorityModal(true)}>
                <View style={[styles.selectorDot, { backgroundColor: PRIORITY_CONFIG[newPriority]?.color ?? "#aaa" }]} />
                <Text style={styles.selectorBtnText}>{newPriority || "Select Priority"}</Text>
                <Ionicons name="chevron-down" size={16} color="#90A4AE" />
              </TouchableOpacity>

              {/* Assign Team Member */}
              <Text style={styles.panelLabel}>Assign to Officer</Text>
              <TouchableOpacity style={styles.selectorBtn} onPress={() => setShowTeamModal(true)}>
                <Ionicons name="person-outline" size={16} color="#546E7A" />
                <Text style={styles.selectorBtnText}>
                  {assignedMember
                    ? TEAM_MEMBERS.find((m) => m.id === assignedMember)?.name ?? "Assigned"
                    : "Select Officer"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#90A4AE" />
              </TouchableOpacity>

              {/* Officer Note */}
              <Text style={styles.panelLabel}>Officer Notes / Resolution Text</Text>
              <TextInput
                style={[styles.input, styles.textArea, { marginTop: 0 }]}
                placeholder="Add notes, steps taken, or resolution details..."
                placeholderTextColor="#aaa"
                value={officerNote}
                onChangeText={setOfficerNote}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={600}
              />
              <Text style={styles.charCount}>{officerNote.length}/600</Text>

              {/* Resolution Photos */}
              <Text style={styles.panelLabel}>Resolution Photos (proof of fix)</Text>
              <View style={styles.photoGrid}>
                {resolutionPhotos.map((uri, index) => (
                  <View key={index} style={styles.photoWrapper}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                    <TouchableOpacity style={styles.removePhoto} onPress={() => setResolutionPhotos((prev) => prev.filter((_, i) => i !== index))}>
                      <Ionicons name="close-circle" size={22} color="#E53935" />
                    </TouchableOpacity>
                  </View>
                ))}
                {resolutionPhotos.length < 5 && (
                  <TouchableOpacity style={styles.addPhotoBtn} onPress={() => pickPhotos(setResolutionPhotos, resolutionPhotos)}>
                    <Ionicons name="camera" size={26} color="#1565C0" />
                    <Text style={styles.addPhotoBtnText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.submitBtnDisabled]}
                onPress={handleSaveUpdate}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={styles.saveBtnText}>Save Update</Text></>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  // ── Modals ─────────────────────────────────────────────────────────────────
  const renderModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    children: React.ReactNode
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{title}</Text>
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  // ── Root ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}><Ionicons name="alert-circle" size={26} color="#E53935" /></View>
        <View>
          <Text style={styles.headerTitle}>Grievance Portal</Text>
          <Text style={styles.headerSubtitle}>Submit or manage complaints</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(["submit", "track"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons name={tab === "submit" ? "create-outline" : "search-outline"} size={16} color={activeTab === tab ? "#fff" : "#666"} />
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab === "submit" ? "Submit Complaint" : "Track / Manage"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "submit" ? renderSubmitTab() : renderTrackTab()}

      {/* Status Modal */}
      {renderModal(showStatusModal, () => setShowStatusModal(false), "Update Status",
        <View style={styles.modalList}>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <TouchableOpacity
              key={key}
              style={[styles.modalOption, newStatus === key && styles.modalOptionActive]}
              onPress={() => { setNewStatus(key); setShowStatusModal(false); }}
            >
              <View style={[styles.modalOptionDot, { backgroundColor: val.color }]} />
              <Text style={styles.modalOptionText}>{val.label}</Text>
              {newStatus === key && <Ionicons name="checkmark" size={16} color="#0A2342" />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Priority Modal */}
      {renderModal(showPriorityModal, () => setShowPriorityModal(false), "Set Priority",
        <View style={styles.modalList}>
          {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
            <TouchableOpacity
              key={key}
              style={[styles.modalOption, newPriority === key && styles.modalOptionActive]}
              onPress={() => { setNewPriority(key); setShowPriorityModal(false); }}
            >
              <View style={[styles.modalOptionDot, { backgroundColor: val.color }]} />
              <Text style={styles.modalOptionText}>{val.label}</Text>
              {newPriority === key && <Ionicons name="checkmark" size={16} color="#0A2342" />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Team Modal */}
      {renderModal(showTeamModal, () => setShowTeamModal(false), "Assign to Officer",
        <View style={styles.modalList}>
          <TouchableOpacity
            style={[styles.modalOption, !assignedMember && styles.modalOptionActive]}
            onPress={() => { setAssignedMember(""); setShowTeamModal(false); }}
          >
            <Text style={[styles.modalOptionText, { color: "#90A4AE" }]}>Unassigned</Text>
            {!assignedMember && <Ionicons name="checkmark" size={16} color="#0A2342" />}
          </TouchableOpacity>
          {TEAM_MEMBERS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.modalOption, assignedMember === m.id && styles.modalOptionActive]}
              onPress={() => { setAssignedMember(m.id); setShowTeamModal(false); }}
            >
              <View style={[styles.teamMiniAvatar, { backgroundColor: m.color + "22" }]}>
                <Text style={[styles.teamMiniAvatarText, { color: m.color }]}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalOptionText}>{m.name}</Text>
                <Text style={styles.modalOptionSub}>{m.dept}</Text>
              </View>
              {assignedMember === m.id && <Ionicons name="checkmark" size={16} color="#0A2342" />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Detail Row Helper ─────────────────────────────────────────────────────────
function DetailRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={13} color="#888" />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },

  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", paddingHorizontal: 20,
    paddingTop: 18, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: "#EEE",
  },
  headerIcon:     { backgroundColor: "#FFEBEE", borderRadius: 10, padding: 10 },
  headerTitle:    { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },
  headerSubtitle: { fontSize: 12, color: "#666", marginTop: 2 },

  tabBar: {
    flexDirection: "row", gap: 10,
    backgroundColor: "#fff", paddingHorizontal: 20,
    paddingBottom: 14, paddingTop: 4,
    borderBottomWidth: 1, borderBottomColor: "#EEE",
  },
  tabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10, borderRadius: 10,
    backgroundColor: "#F0F4F8", borderWidth: 1.5, borderColor: "#E0E0E0",
  },
  tabBtnActive:     { backgroundColor: "#0A2342", borderColor: "#0A2342" },
  tabBtnText:       { fontSize: 13, fontWeight: "600", color: "#666" },
  tabBtnTextActive: { color: "#fff" },

  tabContent: { padding: 16, paddingBottom: 60 },

  uidBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#E8F5E9", borderRadius: 10, padding: 12, marginBottom: 18,
    borderLeftWidth: 4, borderLeftColor: "#1B5E20",
  },
  uidBannerText: { fontSize: 13, color: "#2E7D32", flex: 1 },
  uidBannerUID:  { fontWeight: "800", letterSpacing: 0.5 },
  uidBannerLink: { fontSize: 13, fontWeight: "700", color: "#0D47A1" },

  label: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 8, marginTop: 4 },

  categoryRow: { marginBottom: 18 },
  categoryChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 10,
    borderWidth: 1.5, borderColor: "#E0E0E0",
  },
  categoryChipActive:     { backgroundColor: "#1565C0", borderColor: "#1565C0" },
  categoryChipText:       { fontSize: 13, color: "#555", fontWeight: "500" },
  categoryChipTextActive: { color: "#fff" },

  input: {
    backgroundColor: "#fff", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: "#1A1A2E",
    borderWidth: 1.5, borderColor: "#E0E0E0", marginBottom: 14,
  },
  textArea:  { height: 110, marginBottom: 4 },
  charCount: { fontSize: 11, color: "#aaa", textAlign: "right", marginBottom: 14 },

  photoGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  photoWrapper: { position: "relative" },
  photoThumb:   { width: 90, height: 90, borderRadius: 10, backgroundColor: "#eee" },
  removePhoto:  { position: "absolute", top: -8, right: -8, backgroundColor: "#fff", borderRadius: 12 },
  addPhotoBtn: {
    width: 90, height: 90, borderRadius: 10,
    borderWidth: 2, borderColor: "#1565C0", borderStyle: "dashed",
    alignItems: "center", justifyContent: "center", backgroundColor: "#EEF3FF",
  },
  addPhotoBtnText: { fontSize: 11, color: "#1565C0", fontWeight: "600", marginTop: 4 },

  submitBtn: {
    backgroundColor: "#E53935", borderRadius: 12, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    shadowColor: "#E53935", shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText:     { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Track tab
  searchRow:  { flexDirection: "row", gap: 10, marginBottom: 12 },
  searchInput: {
    flex: 1, backgroundColor: "#fff", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: "#1A1A2E",
    borderWidth: 1.5, borderColor: "#E0E0E0",
    fontWeight: "600", letterSpacing: 0.8,
  },
  searchBtn: {
    backgroundColor: "#0A2342", borderRadius: 10,
    paddingHorizontal: 18, justifyContent: "center", alignItems: "center",
  },

  // Filter
  filterToggle: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 10,
    borderWidth: 1.5, borderColor: "#E0E0E0",
  },
  filterToggleText: { fontSize: 13, fontWeight: "700", color: "#0A2342", flex: 1 },
  filterCountBadge: { backgroundColor: "#0A2342", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  filterCountText:  { fontSize: 11, color: "#fff", fontWeight: "800" },
  filterPanel: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 14,
    borderWidth: 1.5, borderColor: "#E8ECF0",
  },
  filterLabel: { fontSize: 10, fontWeight: "800", color: "#90A4AE", letterSpacing: 1.5, marginBottom: 8 },
  filterChip: {
    backgroundColor: "#F0F4F8", borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6, marginRight: 8,
    borderWidth: 1.5, borderColor: "#E0E0E0",
  },
  filterChipActive:     { backgroundColor: "#0A2342", borderColor: "#0A2342" },
  filterChipText:       { fontSize: 12, fontWeight: "600", color: "#546E7A" },
  filterChipTextActive: { color: "#fff" },
  sortRow: { flexDirection: "row", gap: 8 },
  sortChip: {
    flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10,
    backgroundColor: "#F0F4F8", borderWidth: 1.5, borderColor: "#E0E0E0",
  },
  sortChipActive:     { backgroundColor: "#0A2342", borderColor: "#0A2342" },
  sortChipText:       { fontSize: 12, fontWeight: "700", color: "#546E7A" },
  sortChipTextActive: { color: "#fff" },

  // Complaints list
  complaintsList: { marginBottom: 14 },
  listHeader: { fontSize: 10, fontWeight: "800", color: "#90A4AE", letterSpacing: 1.5, marginBottom: 10 },
  complaintListItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1.5, borderColor: "#EEF2F8",
    shadowColor: "#90A4AE", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  listItemLeft:     { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  listStatusDot:    { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  listItemTitle:    { fontSize: 14, fontWeight: "700", color: "#1A1A2E", marginBottom: 2 },
  listItemUID:      { fontSize: 11, color: "#90A4AE", fontWeight: "600", letterSpacing: 0.5, marginBottom: 6 },
  listItemMeta:     { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  listStatusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  listStatusText:   { fontSize: 9, fontWeight: "800", letterSpacing: 0.3 },
  listPriorityBadge:{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  listPriorityText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.3 },
  listItemDate:     { fontSize: 10, color: "#B0BEC5" },

  backToList: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginBottom: 10, paddingVertical: 4,
  },
  backToListText: { fontSize: 13, color: "#0D47A1", fontWeight: "700" },

  notFound:      { alignItems: "center", paddingTop: 30, gap: 10 },
  notFoundTitle: { fontSize: 17, fontWeight: "700", color: "#E53935" },
  notFoundSub:   { fontSize: 13, color: "#888", textAlign: "center", paddingHorizontal: 20 },

  // Result Card
  resultCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 18, marginBottom: 14,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  uidPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#EEF4FF", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    alignSelf: "flex-start", marginBottom: 10,
  },
  uidPillText: { fontSize: 12, color: "#0D47A1", fontWeight: "800", letterSpacing: 1 },
  resultTitle: { fontSize: 16, fontWeight: "800", color: "#1A1A2E", marginBottom: 10 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    alignSelf: "flex-start", marginBottom: 18,
  },
  statusBadgeText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },

  timeline:      { paddingLeft: 4, marginBottom: 18 },
  timelineStep:  { flexDirection: "row", marginBottom: 4 },
  timelineLeft:  { alignItems: "center", width: 24, marginRight: 14 },
  timelineDot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: "#E0E0E0", backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center",
  },
  timelineDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  timelineLine:     { width: 2, flex: 1, backgroundColor: "#E0E0E0", marginVertical: 3, minHeight: 24 },
  timelineLineDone: { backgroundColor: "#1B5E20" },
  timelineContent:  { flex: 1, paddingBottom: 18 },
  timelineLabel:    { fontSize: 14, color: "#90A4AE", fontWeight: "500" },
  timelineLabelDone:{ color: "#1C2B3A", fontWeight: "700" },
  timelineSub:      { fontSize: 11, color: "#B0BEC5", marginTop: 2 },

  detailBlock: {
    backgroundColor: "#F8FAFB", borderRadius: 10, padding: 12, marginBottom: 16, gap: 10,
  },
  detailRow:   { flexDirection: "row", alignItems: "center", gap: 8 },
  detailLabel: { fontSize: 12, color: "#888", width: 68 },
  detailValue: { fontSize: 13, color: "#222", fontWeight: "600", flex: 1 },

  sectionMicro: { fontSize: 10, fontWeight: "800", color: "#90A4AE", letterSpacing: 1.5, marginBottom: 6 },
  resultDesc:   { fontSize: 13, color: "#546E7A", lineHeight: 20, marginBottom: 16 },

  officerNoteBox: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: "#EEF4FF", borderRadius: 10, padding: 12,
    borderLeftWidth: 3, borderLeftColor: "#0D47A1",
  },
  officerNoteLabel: { fontSize: 9, fontWeight: "800", color: "#0D47A1", letterSpacing: 1, marginBottom: 4 },
  officerNoteText:  { fontSize: 13, color: "#1C2B3A", lineHeight: 19 },

  trackPhoto: { width: 110, height: 85, borderRadius: 8, backgroundColor: "#eee" },

  // Officer Panel
  officerPanel: {
    backgroundColor: "#0A2342", borderRadius: 16, padding: 18, marginBottom: 14,
    shadowColor: "#0A2342", shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  officerPanelHeader: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)", paddingBottom: 14,
  },
  officerPanelTitle: { fontSize: 12, fontWeight: "800", color: "#FFD700", letterSpacing: 2 },
  panelLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: 1, marginBottom: 8, marginTop: 14 },

  selectorBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.15)",
  },
  selectorDot:     { width: 10, height: 10, borderRadius: 5 },
  selectorBtnText: { fontSize: 14, color: "#fff", fontWeight: "600", flex: 1 },

  saveBtn: {
    backgroundColor: "#E53935", borderRadius: 12, paddingVertical: 15, marginTop: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    shadowColor: "#E53935", shadowOpacity: 0.4, shadowRadius: 10, elevation: 5,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 36, paddingTop: 14,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: "#E0E0E0", borderRadius: 2,
    alignSelf: "center", marginBottom: 18,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#1A1A2E", marginBottom: 16 },
  modalList:  { gap: 4 },
  modalOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 13, paddingHorizontal: 12, borderRadius: 12,
  },
  modalOptionActive:  { backgroundColor: "#F0F4F8" },
  modalOptionDot:     { width: 10, height: 10, borderRadius: 5 },
  modalOptionText:    { fontSize: 14, color: "#1A1A2E", fontWeight: "600", flex: 1 },
  modalOptionSub:     { fontSize: 11, color: "#90A4AE", marginTop: 2 },
  teamMiniAvatar: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: "center", alignItems: "center",
  },
  teamMiniAvatarText: { fontSize: 12, fontWeight: "800" },
});