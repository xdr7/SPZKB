import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from seed_data import seed_database

if __name__ == "__main__":
    seed_database()
