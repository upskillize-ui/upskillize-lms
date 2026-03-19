"""
ingest_courses.py — Run this to ingest all course content into your TestGen agent
This fixes the 404 "No content found" error

Usage:
  python ingest_courses.py

What it does:
  - Calls your TestGen agent's /api/ingest/course endpoint for each course
  - The agent fetches content from your MySQL database
  - Embeds it into the vector store so questions can be generated

You only need to run this ONCE per course (or when content changes)
"""

import requests
import sys

# Your TestGen agent URL on HuggingFace Spaces
AGENT_URL = "https://upskill25-myagent.hf.space"

# Your course IDs — add all your course IDs here
COURSE_IDS = [1, 6]  # ← UPDATE these with your actual course IDs


def check_agent():
    """Check if agent is running."""
    print(f"Checking agent at {AGENT_URL}...")
    try:
        r = requests.get(f"{AGENT_URL}/api/health", timeout=10)
        data = r.json()
        print(f"  Agent status: {data.get('status', 'unknown')}")
        print(f"  Version: {data.get('version', 'unknown')}")
        return True
    except Exception as e:
        print(f"  Agent is NOT reachable: {e}")
        print(f"  Make sure your HuggingFace Space is running!")
        return False


def ingest_course(course_id):
    """Ingest a single course."""
    print(f"\nIngesting course {course_id}...")
    try:
        r = requests.post(
            f"{AGENT_URL}/api/ingest/course",
            json={"course_id": course_id},
            timeout=60,
        )
        data = r.json()
        print(f"  Status: {data.get('status', 'unknown')}")
        print(f"  Message: {data.get('message', '')}")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False


def ingest_lecture(lecture_id):
    """Ingest a single lecture."""
    print(f"\nIngesting lecture {lecture_id}...")
    try:
        r = requests.post(
            f"{AGENT_URL}/api/ingest/lecture",
            json={"lecture_id": lecture_id},
            timeout=30,
        )
        data = r.json()
        print(f"  Status: {data.get('status', 'unknown')}")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("UPSKILLIZE — Course Content Ingestion Tool")
    print("=" * 50)

    if not check_agent():
        print("\nAgent is offline. Please start it first.")
        sys.exit(1)

    print(f"\nWill ingest {len(COURSE_IDS)} courses: {COURSE_IDS}")
    print("This runs in the background — you can check agent logs for progress.\n")

    success = 0
    failed = 0

    for cid in COURSE_IDS:
        if ingest_course(cid):
            success += 1
        else:
            failed += 1

    print("\n" + "=" * 50)
    print(f"Done! {success} courses queued, {failed} failed.")
    print("Content will be embedded in the background (1-5 min per course).")
    print("After ingestion completes, students can generate tests!")
    print("=" * 50)
