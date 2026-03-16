"""
Async-safe storage for the active request ID.

ContextVar provides per-task isolation in asyncio, so middleware can set the
request ID for one coroutine without affecting any other concurrent request.
"""
from contextvars import ContextVar


request_id_var: ContextVar[str] = ContextVar("request_id", default="-")
