from app.core.security import hash_password, verify_password


password = "hello123"

hash1 = hash_password(password)
hash2 = hash_password(password)

print("Hash 1:", hash1)
print("Hash 2:", hash2)

print("Hashes equal:", hash1 == hash2)

print(
    "Hash 1 verifies:",
    verify_password(password, hash1)
)

print(
    "Hash 2 verifies:",
    verify_password(password, hash2)
)